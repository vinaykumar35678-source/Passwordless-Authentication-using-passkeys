import json
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session as DBSession

import webauthn
from webauthn.helpers import (
    bytes_to_base64url,
    base64url_to_bytes,
    options_to_json,
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    ResidentKeyRequirement,
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialType,
    RegistrationCredential,
    AuthenticationCredential,
)

from app.config import settings
from app.models import AuthChallenge, User, Credential, AuthLog

class WebAuthnService:
    @staticmethod
    def create_registration_options(
        db: DBSession,
        username: str,
        full_name: str,
        user_id_bytes: bytes,
        existing_credentials: List[Credential] = None
    ) -> Dict[str, Any]:
        """
        Generates standard WebAuthn PublicKeyCredentialCreationOptions and saves single-use challenge.
        """
        exclude_credentials = []
        if existing_credentials:
            for cred in existing_credentials:
                exclude_credentials.append(
                    PublicKeyCredentialDescriptor(
                        type=PublicKeyCredentialType.PUBLIC_KEY,
                        id=cred.credential_id
                    )
                )

        options = webauthn.generate_registration_options(
            rp_id=settings.RP_ID,
            rp_name=settings.RP_NAME,
            user_id=user_id_bytes,
            user_name=username,
            user_display_name=full_name,
            authenticator_selection=AuthenticatorSelectionCriteria(
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.PREFERRED
            ),
            exclude_credentials=exclude_credentials if exclude_credentials else None,
            timeout=60000,
        )

        # Store challenge in DB with expiration
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.CHALLENGE_TIMEOUT_SECONDS)
        challenge_record = AuthChallenge(
            challenge=options.challenge,
            username=username,
            purpose="registration",
            expires_at=expires_at,
            used=0
        )
        db.add(challenge_record)
        db.commit()

        # Return options parsed from official options_to_json (RFC/W3C Level 3 JSON)
        return json.loads(options_to_json(options))

    @staticmethod
    def verify_registration(
        db: DBSession,
        username: str,
        credential_payload: Any
    ) -> Any:
        """
        Verifies client-provided registration credential against stored single-use challenge.
        """
        now = datetime.now(timezone.utc)
        # Find active valid challenge for this username
        challenge_record = db.query(AuthChallenge).filter(
            AuthChallenge.username == username,
            AuthChallenge.purpose == "registration",
            AuthChallenge.used == 0,
            AuthChallenge.expires_at > now
        ).order_by(AuthChallenge.created_at.desc()).first()

        if not challenge_record:
            raise ValueError("Registration challenge expired or does not exist. Please try again.")

        # Mark challenge as used immediately to prevent replay
        challenge_record.used = 1
        db.commit()

        # Parse credential payload into webauthn RegistrationCredential if dict
        try:
            verified = webauthn.verify_registration_response(
                credential=credential_payload,
                expected_challenge=challenge_record.challenge,
                expected_rp_id=settings.RP_ID,
                expected_origin=settings.ALLOWED_ORIGINS,
                require_user_verification=False
            )
            return verified
        except Exception as e:
            raise ValueError(f"Registration verification failed: {str(e)}")

    @staticmethod
    def create_authentication_options(
        db: DBSession,
        username: Optional[str] = None,
        user: Optional[User] = None
    ) -> Dict[str, Any]:
        """
        Generates standard WebAuthn PublicKeyCredentialRequestOptions.
        If user is provided, restricts allowCredentials to user's registered keys.
        """
        allow_credentials = []
        if user and user.credentials:
            for cred in user.credentials:
                allow_credentials.append(
                    PublicKeyCredentialDescriptor(
                        type=PublicKeyCredentialType.PUBLIC_KEY,
                        id=cred.credential_id
                    )
                )

        options = webauthn.generate_authentication_options(
            rp_id=settings.RP_ID,
            allow_credentials=allow_credentials if allow_credentials else None,
            user_verification=UserVerificationRequirement.PREFERRED,
            timeout=60000,
        )

        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.CHALLENGE_TIMEOUT_SECONDS)
        challenge_record = AuthChallenge(
            challenge=options.challenge,
            username=username if username else (user.username if user else None),
            user_id=user.id if user else None,
            purpose="authentication",
            expires_at=expires_at,
            used=0
        )
        db.add(challenge_record)
        db.commit()

        return json.loads(options_to_json(options))

    @staticmethod
    def verify_authentication(
        db: DBSession,
        credential_payload: Any,
        username: Optional[str] = None
    ) -> Tuple[User, Credential]:
        """
        Verifies authentication assertion against stored public key, origin, challenge, and sign count.
        """
        now = datetime.now(timezone.utc)
        
        # Extract raw credential_id from payload (it is base64url encoded in JSON)
        raw_cred_id_str = credential_payload.get("id") if isinstance(credential_payload, dict) else getattr(credential_payload, "id", None)
        if not raw_cred_id_str:
            raise ValueError("Credential payload missing credential ID.")

        try:
            cred_id_bytes = base64url_to_bytes(raw_cred_id_str)
        except Exception:
            raise ValueError("Invalid credential ID encoding.")

        # Look up credential in DB
        credential = db.query(Credential).filter(Credential.credential_id == cred_id_bytes).first()
        if not credential:
            raise ValueError("Passkey credential not recognized on this server.")

        user = db.query(User).filter(User.id == credential.user_id).first()
        if not user:
            raise ValueError("User associated with this passkey was not found.")

        # If username was specified, ensure it matches
        if username and user.username.lower() != username.lower() and user.email.lower() != username.lower():
            raise ValueError("Credential does not belong to the specified user.")

        # Find matching authentication challenge
        challenge_query = db.query(AuthChallenge).filter(
            AuthChallenge.purpose == "authentication",
            AuthChallenge.used == 0,
            AuthChallenge.expires_at > now
        )
        if username:
            challenge_query = challenge_query.filter(
                (AuthChallenge.username == username) | (AuthChallenge.user_id == user.id)
            )
        
        challenge_record = challenge_query.order_by(AuthChallenge.created_at.desc()).first()
        if not challenge_record:
            # Check if there is any global valid auth challenge for discoverable passkeys
            challenge_record = db.query(AuthChallenge).filter(
                AuthChallenge.purpose == "authentication",
                AuthChallenge.used == 0,
                AuthChallenge.expires_at > now
            ).order_by(AuthChallenge.created_at.desc()).first()

        if not challenge_record:
            raise ValueError("Authentication challenge expired or invalid. Please request a new login.")

        # Invalidate challenge immediately (single-use guarantee)
        challenge_record.used = 1
        db.commit()

        try:
            verified = webauthn.verify_authentication_response(
                credential=credential_payload,
                expected_challenge=challenge_record.challenge,
                expected_rp_id=settings.RP_ID,
                expected_origin=settings.ALLOWED_ORIGINS,
                credential_public_key=credential.public_key,
                credential_current_sign_count=credential.sign_count,
                require_user_verification=False
            )
        except Exception as e:
            # Record failed login attempt in audit log
            db.add(AuthLog(
                user_id=user.id,
                username=user.username,
                event_type="LOGIN_FAILED",
                status="FAILED",
                details=f"Cryptographic verification rejected: {str(e)[:100]}"
            ))
            db.commit()
            raise ValueError(f"Cryptographic authentication failed: {str(e)}")

        # Update credential signature counter to prevent cloned authenticator attacks
        credential.sign_count = verified.new_sign_count
        credential.last_used_at = datetime.now(timezone.utc)
        user.last_login = datetime.now(timezone.utc)

        # Record successful authentication in audit log
        db.add(AuthLog(
            user_id=user.id,
            username=user.username,
            event_type="LOGIN_SUCCESS",
            status="SUCCESS",
            details=f"Authenticated with {credential.device_name} (counter={verified.new_sign_count})"
        ))
        db.commit()

        return user, credential
