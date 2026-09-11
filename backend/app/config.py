import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    RP_ID: str = os.getenv("RP_ID", "localhost")
    RP_NAME: str = os.getenv("RP_NAME", "Passkey Authentication System")
    ORIGIN: str = os.getenv("ORIGIN", "http://localhost:5173")
    # Support multiple origins if needed (e.g. 127.0.0.1:5173 or preview)
    ALLOWED_ORIGINS: list[str] = [
        os.getenv("ORIGIN", "http://localhost:5173"),
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./passkey.db")
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "college-seminar-passkey-secret-key-32bytes-min")
    CHALLENGE_TIMEOUT_SECONDS: int = int(os.getenv("CHALLENGE_TIMEOUT_SECONDS", "300"))
    SESSION_LIFETIME_DAYS: int = int(os.getenv("SESSION_LIFETIME_DAYS", "7"))
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
