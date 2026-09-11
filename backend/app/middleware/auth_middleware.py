import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request, Cookie
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models import Session, User
from app.config import settings

def create_user_session(db: DBSession, user_id: str) -> str:
    """
    Creates a cryptographically secure session token and persists it.
    """
    token = secrets.token_urlsafe(48)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.SESSION_LIFETIME_DAYS)
    
    session = Session(
        id=token,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(session)
    db.commit()
    return token

def terminate_user_session(db: DBSession, token: str) -> None:
    """
    Destroys a session on logout.
    """
    db.query(Session).filter(Session.id == token).delete()
    db.commit()

def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    db: DBSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to enforce authentication on protected endpoints.
    Checks Authorization: Bearer <token> or session_token cookie.
    """
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "").strip()
    elif session_token:
        token = session_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in with your passkey.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    now = datetime.now(timezone.utc)
    session = db.query(Session).filter(
        Session.id == token,
        Session.expires_at > now
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
