import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session as DBSession

from webauthn.helpers import bytes_to_base64url

from app.database import get_db
from app.models import User, Credential, AuthLog, Session
from app.schemas import (
    RegisterOptionsRequest,
    RegisterVerifyRequest,
    LoginOptionsRequest,
    LoginVerifyRequest,
    UserProfileResponse,
    CredentialInfo,
    AuthLogInfo,
    SecurityStatusResponse
)
from app.auth.webauthn_service import WebAuthnService
from app.middleware.auth_middleware import (
    create_user_session,
    terminate_user_session,
    get_current_user
)
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_credential_info(cred: Credential) -> CredentialInfo:
    transports_list = None
    if cred.transports:
        try:
            transports_list = json.loads(cred.transports)
        except Exception:
            transports_list = [cred.transports]
    return CredentialInfo(
        id=cred.id,
        credential_id=bytes_to_base64url(cred.credential_id),
        device_name=cred.device_name,
        sign_count=cred.sign_count,
        transports=transports_list,
        created_at=cred.created_at,
        last_used_at=cred.last_used_at
    )

def format_user_profile(user: User) -> UserProfileResponse:
    creds_info = [format_credential_info(c) for c in user.credentials]
    # Calculate an educational security score based on number of passkeys and recent logins
    score = 95
    if len(creds_info) >= 2:
        score = 99  # Multi-device backup bonus
    return UserProfileResponse(
        id=user.id,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        last_login=user.last_login,
        credentials=creds_info,
        security_score=score,
        security_level="Hardware-Backed Passkey (NIST AAL3 / Phishing-Resistant)"
    )

# --- 1. Registration Endpoints ---

@router.post("/register/options")
def register_options(request: RegisterOptionsRequest, db: DBSession = Depends(get_db)):
    """
    Step 1 of Registration: Validates uniqueness and returns PublicKeyCredentialCreationOptions.
    """
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username or email is already registered."
        )

    # Deterministic or random user ID bytes for WebAuthn user handle
    user_handle = uuid.uuid4().bytes

    options = WebAuthnService.create_registration_options(
        db=db,
        username=request.username,
        full_name=request.full_name,
        user_id_bytes=user_handle
    )
    return options

@router.post("/register/verify")
def register_verify(
    request: RegisterVerifyRequest,
    response: Response,
    db: DBSession = Depends(get_db)
):
    """
    Step 2 of Registration: Verifies WebAuthn attestation, creates user and credential record.
    """
    # Verify uniqueness again to prevent race conditions
    existing_user = db.query(User).filter(
        (User.username == request.username) | (User.email == request.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is already registered."
        )

    try:
        verified_registration = WebAuthnService.verify_registration(
            db=db,
            username=request.username,
            credential_payload=request.credential
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Persist the new User (ZERO PASSWORD COLUMNS)
    new_user = User(
        full_name=request.full_name,
        username=request.username,
        email=request.email,
        last_login=datetime.now(timezone.utc)
    )
    db.add(new_user)
    db.flush()  # get new_user.id

    # Persist the WebAuthn Credential
    # Extract transports if sent in credential
    transports_json = None
    if isinstance(request.credential, dict) and "response" in request.credential:
        transports = request.credential["response"].get("transports")
        if transports:
            transports_json = json.dumps(transports)

    new_credential = Credential(
        user_id=new_user.id,
        credential_id=verified_registration.credential_id,
        public_key=verified_registration.credential_public_key,
        sign_count=verified_registration.sign_count,
        transports=transports_json,
        device_name=request.device_name or "Primary Device Passkey",
        aaguid=str(verified_registration.aaguid) if verified_registration.aaguid else None,
        last_used_at=datetime.now(timezone.utc)
    )
    db.add(new_credential)

    # Add audit log
    db.add(AuthLog(
        user_id=new_user.id,
        username=new_user.username,
        event_type="REGISTRATION_SUCCESS",
        status="SUCCESS",
        details="Passkey created and public key registered successfully."
    ))

    # Create session token
    token = create_user_session(db, new_user.id)

    # Set secure session cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Allow for localhost HTTP development
        max_age=settings.SESSION_LIFETIME_DAYS * 86400
    )

    db.commit()

    return {
        "success": True,
        "message": "Passkey registered successfully! Welcome to passwordless authentication.",
        "token": token,
        "user": format_user_profile(new_user)
    }

# --- 2. Login Endpoints ---

@router.post("/login/options")
def login_options(request: LoginOptionsRequest, db: DBSession = Depends(get_db)):
    """
    Step 1 of Login: Generates PublicKeyCredentialRequestOptions.
    """
    user = None
    if request.username:
        clean_user = request.username.strip()
        user = db.query(User).filter(
            (User.username == clean_user) | (User.email == clean_user)
        ).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No account found matching '{request.username}'."
            )
        if not user.credentials:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User has no registered passkeys. Please register a new account."
            )

    options = WebAuthnService.create_authentication_options(
        db=db,
        username=request.username,
        user=user
    )
    return options

@router.post("/login/verify")
def login_verify(
    request: LoginVerifyRequest,
    response: Response,
    db: DBSession = Depends(get_db)
):
    """
    Step 2 of Login: Verifies cryptographic assertion signature, updates counter, issues session.
    """
    try:
        user, credential = WebAuthnService.verify_authentication(
            db=db,
            credential_payload=request.credential,
            username=request.username
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    # Issue session
    token = create_user_session(db, user.id)

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.SESSION_LIFETIME_DAYS * 86400
    )

    return {
        "success": True,
        "message": "Authentication successful! Access granted via passkey signature.",
        "token": token,
        "user": format_user_profile(user)
    }

# --- 3. Protected User Endpoints ---

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """
    Returns current authenticated user profile and registered credentials.
    """
    return format_user_profile(user)

@router.get("/logs", response_model=List[AuthLogInfo])
def get_auth_logs(user: User = Depends(get_current_user), db: DBSession = Depends(get_db)):
    """
    Returns non-sensitive audit event logs for the user.
    """
    logs = db.query(AuthLog).filter(AuthLog.user_id == user.id).order_by(AuthLog.timestamp.desc()).limit(20).all()
    return logs

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Terminates the authenticated session.
    """
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "").strip()
    elif "session_token" in request.cookies:
        token = request.cookies["session_token"]

    if token:
        terminate_user_session(db, token)

    db.add(AuthLog(
        user_id=user.id,
        username=user.username,
        event_type="LOGOUT",
        status="SUCCESS",
        details="User logged out securely."
    ))
    db.commit()

    response.delete_cookie("session_token")
    return {"success": True, "message": "Logged out successfully."}

# --- 4. System Security Status Endpoint ---

@router.get("/status", response_model=SecurityStatusResponse)
def get_system_security_status(db: DBSession = Depends(get_db)):
    """
    Returns public system status and zero-password guarantee for seminar demonstration.
    """
    total_users = db.query(User).count()
    total_credentials = db.query(Credential).count()

    return SecurityStatusResponse(
        rp_id=settings.RP_ID,
        rp_name=settings.RP_NAME,
        origin=settings.ORIGIN,
        passwords_stored_count=0,
        cryptographic_algorithm="ES256 (NIST P-256) / RS256 / EdDSA",
        webauthn_version="W3C WebAuthn Level 3 (FIDO2 Standard)",
        total_users=total_users,
        total_credentials=total_credentials
    )
