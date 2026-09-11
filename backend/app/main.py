import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.routes.auth_routes import router as auth_router
from app.routes.credential_routes import router as credential_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("passkey_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down passkey backend.")

app = FastAPI(
    title="Passwordless Authentication System (WebAuthn / Passkeys)",
    description=(
        "Production-style public-key authentication system adhering to W3C WebAuthn Level 3 "
        "and FIDO2 standards. Cryptographically verifies assertions with zero passwords stored."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration allowing Vite frontend and common development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for clean error messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred. Please try again later."}
    )

# Include API routers
app.include_router(auth_router)
app.include_router(credential_router)

# Direct /api/me route per requirement 10
from app.middleware.auth_middleware import get_current_user
from app.routes.auth_routes import format_user_profile
from app.models import User
from app.schemas import UserProfileResponse
from fastapi import Depends

@app.get("/api/me", response_model=UserProfileResponse, tags=["User"])
def api_me(user: User = Depends(get_current_user)):
    return format_user_profile(user)

@app.get("/")
def root():
    return {
        "system": "Passwordless Authentication Backend",
        "standard": "W3C WebAuthn / FIDO2",
        "relying_party": settings.RP_ID,
        "passwords_stored": 0,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
