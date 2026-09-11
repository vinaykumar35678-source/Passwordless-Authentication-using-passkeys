import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from webauthn.helpers import bytes_to_base64url, base64url_to_bytes

from app.database import get_db
from app.models import User, Credential, AuthLog
from app.schemas import (
    AddPasskeyOptionsRequest,
    AddPasskeyVerifyRequest,
    CredentialInfo
)
from app.auth.webauthn_service import WebAuthnService
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/credentials", tags=["Credentials Management"])

@router.get("", response_model=List[CredentialInfo])
def list_credentials(user: User = Depends(get_current_user)):
    """
    Lists all registered passkeys for the current user.
    """
    result = []
    for cred in user.credentials:
        transports_list = None
        if cred.transports:
            try:
                transports_list = json.loads(cred.transports)
            except Exception:
                transports_list = [cred.transports]
        result.append(CredentialInfo(
            id=cred.id,
            credential_id=bytes_to_base64url(cred.credential_id),
            device_name=cred.device_name,
            sign_count=cred.sign_count,
            transports=transports_list,
            created_at=cred.created_at,
            last_used_at=cred.last_used_at
        ))
    return result

@router.post("/add/options")
def add_passkey_options(
    request: AddPasskeyOptionsRequest,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Generates WebAuthn registration options for an already authenticated user
    to register an additional passkey (e.g., secondary phone, laptop, or YubiKey).
    """
    # Use existing user's ID
    user_handle = user.id.encode("utf-8")

    options = WebAuthnService.create_registration_options(
        db=db,
        username=user.username,
        full_name=user.full_name,
        user_id_bytes=user_handle,
        existing_credentials=user.credentials
    )
    return options

@router.post("/add/verify")
def add_passkey_verify(
    request: AddPasskeyVerifyRequest,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Verifies and registers the additional passkey for the authenticated user.
    """
    try:
        verified_registration = WebAuthnService.verify_registration(
            db=db,
            username=user.username,
            credential_payload=request.credential
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Check if credential already exists
    existing = db.query(Credential).filter(
        Credential.credential_id == verified_registration.credential_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This specific passkey has already been added to your account."
        )

    transports_json = None
    if isinstance(request.credential, dict) and "response" in request.credential:
        transports = request.credential["response"].get("transports")
        if transports:
            transports_json = json.dumps(transports)

    new_credential = Credential(
        user_id=user.id,
        credential_id=verified_registration.credential_id,
        public_key=verified_registration.credential_public_key,
        sign_count=verified_registration.sign_count,
        transports=transports_json,
        device_name=request.device_name or "Additional Passkey",
        aaguid=str(verified_registration.aaguid) if verified_registration.aaguid else None,
        last_used_at=datetime.now(timezone.utc)
    )
    db.add(new_credential)

    db.add(AuthLog(
        user_id=user.id,
        username=user.username,
        event_type="ADD_PASSKEY",
        status="SUCCESS",
        details=f"Added passkey: {request.device_name or 'Additional Passkey'}"
    ))
    db.commit()

    return {
        "success": True,
        "message": "Additional passkey registered successfully!",
        "credential_id": bytes_to_base64url(verified_registration.credential_id)
    }

@router.delete("/{credential_id}")
def delete_credential(
    credential_id: str,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Deletes a registered passkey. Ensures that at least one passkey remains.
    """
    if len(user.credentials) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your only passkey. Register a secondary passkey first."
        )

    # credential_id can be UUID or base64url string
    cred = db.query(Credential).filter(
        (Credential.id == credential_id) & (Credential.user_id == user.id)
    ).first()

    if not cred:
        # Try base64url match
        try:
            raw_bytes = base64url_to_bytes(credential_id)
            cred = db.query(Credential).filter(
                (Credential.credential_id == raw_bytes) & (Credential.user_id == user.id)
            ).first()
        except Exception:
            pass

    if not cred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passkey credential not found."
        )

    device_name = cred.device_name
    db.delete(cred)
    db.add(AuthLog(
        user_id=user.id,
        username=user.username,
        event_type="DELETE_PASSKEY",
        status="SUCCESS",
        details=f"Removed passkey: {device_name}"
    ))
    db.commit()

    return {"success": True, "message": f"Passkey '{device_name}' removed successfully."}
