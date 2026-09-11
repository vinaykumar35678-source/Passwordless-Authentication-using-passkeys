import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, LargeBinary, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    credentials = relationship("Credential", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    logs = relationship("AuthLog", back_populates="user", cascade="all, delete-orphan")

    # STRICT SECURITY GUARANTEE:
    # No password column exists in this schema.
    # No private key column exists.
    # No biometric data column exists.


class Credential(Base):
    __tablename__ = "credentials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # WebAuthn Credential ID (stored as base64url string or bytes)
    credential_id = Column(LargeBinary, unique=True, index=True, nullable=False)
    
    # Credential Public Key in COSE format (bytes)
    public_key = Column(LargeBinary, nullable=False)
    
    # Signature counter to detect authenticator cloning
    sign_count = Column(Integer, default=0, nullable=False)
    
    # Authenticator transports (e.g. '["internal", "usb", "ble", "nfc"]')
    transports = Column(Text, nullable=True)
    
    # Device / Passkey nickname for multi-passkey management
    device_name = Column(String(100), default="Primary Passkey", nullable=False)
    aaguid = Column(String(64), nullable=True)
    
    created_at = Column(DateTime, default=utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="credentials")


class AuthChallenge(Base):
    __tablename__ = "auth_challenges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # challenge bytes or base64url string
    challenge = Column(LargeBinary, nullable=False)
    # Temporary username or user_id associated with challenge
    username = Column(String(50), nullable=True, index=True)
    user_id = Column(String(36), nullable=True)
    purpose = Column(String(20), nullable=False)  # 'registration' or 'authentication'
    created_at = Column(DateTime, default=utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Integer, default=0, nullable=False)  # Single-use flag


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True)  # Cryptographic session token
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")


class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    username = Column(String(50), nullable=True)
    event_type = Column(String(50), nullable=False)  # 'REGISTRATION_SUCCESS', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', etc.
    status = Column(String(20), nullable=False)  # 'SUCCESS', 'FAILED', 'INFO'
    details = Column(String(255), nullable=True)  # Non-sensitive description e.g. "Platform authenticator used (sign_count=1)"
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="logs")
