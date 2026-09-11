from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- Registration Schemas ---

class RegisterOptionsRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    email: EmailStr

class RegisterVerifyRequest(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    credential: Any  # WebAuthn registration response object from browser
    device_name: Optional[str] = "Primary Device Passkey"

# --- Login Schemas ---

class LoginOptionsRequest(BaseModel):
    username: Optional[str] = None  # Optional for discoverable credentials (usernameless passkeys)

class LoginVerifyRequest(BaseModel):
    username: Optional[str] = None
    credential: Any  # WebAuthn authentication assertion from browser

# --- Add Passkey (for Authenticated Users) ---

class AddPasskeyOptionsRequest(BaseModel):
    device_name: Optional[str] = "Secondary Device Passkey"

class AddPasskeyVerifyRequest(BaseModel):
    credential: Any
    device_name: Optional[str] = "Secondary Device Passkey"

# --- Response Schemas ---

class CredentialInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    credential_id: str  # Base64URL representation
    device_name: str
    sign_count: int
    transports: Optional[List[str]] = None
    created_at: datetime
    last_used_at: Optional[datetime] = None

class AuthLogInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_type: str
    status: str
    details: Optional[str] = None
    timestamp: datetime

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    username: str
    email: str
    created_at: datetime
    last_login: Optional[datetime] = None
    credentials: List[CredentialInfo] = []
    security_score: int = 95
    security_level: str = "Strong (Passwordless / Hardware-Backed)"

class SecurityStatusResponse(BaseModel):
    rp_id: str
    rp_name: str
    origin: str
    passwords_stored_count: int = 0
    cryptographic_algorithm: str = "ES256 / RS256 (Asymmetric Public-Key Cryptography)"
    webauthn_version: str = "W3C WebAuthn Level 3 (FIDO2 Standard)"
    total_users: int
    total_credentials: int
