import os
import sys
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import Base, get_db
from app.models import User, Credential, AuthChallenge, Session
from app.middleware.auth_middleware import create_user_session

# Use in-memory SQLite database with StaticPool so all connections share the same memory DB
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_system_status_endpoint(client):
    """Verify system status reports zero passwords stored."""
    response = client.get("/api/auth/status")
    assert response.status_code == 200
    data = response.json()
    assert data["passwords_stored_count"] == 0
    assert data["rp_id"] == "localhost"
    assert "ES256" in data["cryptographic_algorithm"]

def test_register_options_generation(client):
    """Test generating WebAuthn registration options with challenge."""
    payload = {
        "full_name": "Alice Researcher",
        "username": "alice_sec",
        "email": "alice@university.edu"
    }
    response = client.post("/api/auth/register/options", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "challenge" in data
    assert data["rp"]["id"] == "localhost"
    assert data["user"]["name"] == "alice_sec"
    assert "pubKeyCredParams" in data

    # Verify challenge was saved in database
    db = TestingSessionLocal()
    challenge = db.query(AuthChallenge).filter(AuthChallenge.username == "alice_sec").first()
    assert challenge is not None
    assert challenge.used == 0
    db.close()

def test_duplicate_user_registration_blocked(client):
    """Verify system rejects duplicate username or email during options generation."""
    db = TestingSessionLocal()
    user = User(
        full_name="Existing User",
        username="existing_user",
        email="existing@university.edu"
    )
    db.add(user)
    db.commit()
    db.close()

    # Try duplicate username
    res1 = client.post("/api/auth/register/options", json={
        "full_name": "Another Name",
        "username": "existing_user",
        "email": "different@university.edu"
    })
    assert res1.status_code == 400
    assert "already registered" in res1.json()["detail"]

    # Try duplicate email
    res2 = client.post("/api/auth/register/options", json={
        "full_name": "Another Name",
        "username": "different_user",
        "email": "existing@university.edu"
    })
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"]

def test_expired_challenge_rejected(client):
    """Verify that an expired challenge cannot be used for verification."""
    db = TestingSessionLocal()
    # Create challenge that expired 10 minutes ago
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=10)
    challenge = AuthChallenge(
        challenge=b"fake_challenge_bytes_123456789012",
        username="test_expired",
        purpose="registration",
        expires_at=expired_time,
        used=0
    )
    db.add(challenge)
    db.commit()
    db.close()

    verify_payload = {
        "username": "test_expired",
        "full_name": "Test Expired",
        "email": "expired@university.edu",
        "credential": {"id": "fake_id"}
    }
    response = client.post("/api/auth/register/verify", json=verify_payload)
    assert response.status_code == 400
    assert "expired" in response.json()["detail"].lower()

def test_protected_route_without_token(client):
    """Verify /api/me returns 401 Unauthorized without session token."""
    response = client.get("/api/me")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_protected_route_with_valid_session(client):
    """Verify /api/me succeeds with valid Bearer token."""
    db = TestingSessionLocal()
    user = User(
        full_name="Bob Engineer",
        username="bob_sec",
        email="bob@university.edu"
    )
    db.add(user)
    db.commit()
    token = create_user_session(db, user.id)
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "bob_sec"
    assert data["email"] == "bob@university.edu"
    assert data["security_score"] >= 95

def test_logout_session_invalidation(client):
    """Verify that logging out destroys the session token."""
    db = TestingSessionLocal()
    user = User(
        full_name="Carol Crypto",
        username="carol_sec",
        email="carol@university.edu"
    )
    db.add(user)
    db.commit()
    token = create_user_session(db, user.id)
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    # First verify access works
    res_me1 = client.get("/api/me", headers=headers)
    assert res_me1.status_code == 200

    # Logout
    res_logout = client.post("/api/auth/logout", headers=headers)
    assert res_logout.status_code == 200

    # Verify subsequent access fails
    res_me2 = client.get("/api/me", headers=headers)
    assert res_me2.status_code == 401

def test_delete_sole_passkey_prevented(client):
    """Verify user cannot delete their only registered passkey."""
    db = TestingSessionLocal()
    user = User(
        full_name="Dave Security",
        username="dave_sec",
        email="dave@university.edu"
    )
    db.add(user)
    db.commit()
    cred = Credential(
        user_id=user.id,
        credential_id=b"dave_cred_123",
        public_key=b"fake_public_key_cose",
        device_name="Dave Laptop"
    )
    db.add(cred)
    db.commit()
    cred_id = cred.id
    token = create_user_session(db, user.id)
    db.close()

    headers = {"Authorization": f"Bearer {token}"}
    del_res = client.delete(f"/api/credentials/{cred_id}", headers=headers)
    assert del_res.status_code == 400
    assert "Cannot delete your only passkey" in del_res.json()["detail"]
