# System Architecture: Passwordless Authentication Using Passkeys and WebAuthn

## 1. Architectural Overview

This project implements a production-grade, zero-password authentication system adhering to the **W3C Web Authentication (WebAuthn) Level 3** and **FIDO2** specifications. The application decouples user identification from secret sharing, utilizing hardware-backed asymmetric key cryptography (ECDSA over NIST P-256 curve) to authenticate users with platform authenticators (Windows Hello, Touch ID, Face ID, PIN) or roaming hardware security keys (YubiKeys).

---

## 2. High-Level Component Architecture

```mermaid
graph TD
    subgraph Client ["Client Tier (Browser)"]
        UI["Cybersecurity React 19 UI"]
        WAPI["W3C WebAuthn Browser API<br/>navigator.credentials"]
        Auth["Platform Authenticator<br/>TPM / Secure Enclave"]
    end

    subgraph Server ["Server Tier (FastAPI)"]
        API["FastAPI REST Endpoints<br/>/api/auth/*"]
        PyWA["PyWebAuthn Cryptographic Engine<br/>Challenge & Signature Verification"]
        Sess["Session Security Manager<br/>Bearer Tokens & Cookie Handlers"]
    end

    subgraph Data ["Data Tier (SQLite)"]
        DB[(passkey.db)]
        Users["users Table<br/>(ZERO Password Columns)"]
        Creds["credentials Table<br/>(COSE Public Keys & Counters)"]
        Chall["auth_challenges Table<br/>(Single-use Nonces & TTL)"]
    end

    UI -->|1. Request Options| API
    API -->|2. Generate Nonce| PyWA
    PyWA -->|3. Creation / Request Options| API
    API -->|4. Return JSON Options| UI
    UI -->|5. Invoke WebAuthn| WAPI
    WAPI -->|6. User Verification & Signing| Auth
    Auth -->|7. Assertion Signature| WAPI
    WAPI -->|8. Return Credential Payload| UI
    UI -->|9. Transmit Assertion| API
    API -->|10. Cryptographic Verification| PyWA
    PyWA -->|11. Query Public Key & Counter| DB
    API -->|12. Establish Session| Sess
    Sess -->|13. Return Authenticated Token| UI
```

---

## 3. WebAuthn Cryptographic Sequences

### A. Registration Flow (Credential Creation)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client Browser
    participant Authenticator as Hardware Authenticator (TPM/Enclave)
    participant Server as FastAPI Server
    participant DB as SQLite Database

    User->>Browser: Enters Full Name, Username, Email
    Browser->>Server: POST /api/auth/register/options
    Server->>DB: Check uniqueness (username & email)
    Server->>Server: Generate 32-byte Cryptographic Nonce (Challenge)
    Server->>DB: Store challenge (5m TTL, used=0)
    Server-->>Browser: PublicKeyCredentialCreationOptions (JSON)
    Browser->>Authenticator: navigator.credentials.create(options)
    Authenticator->>User: Prompts for Biometric scan (Fingerprint/Face) or PIN
    User->>Authenticator: Verifies presence locally
    Authenticator->>Authenticator: Generate Asymmetric Keypair (ECDSA P-256)
    Authenticator->>Authenticator: Stores Private Key in Secure Enclave 🔒
    Authenticator-->>Browser: Attestation Object + Public Key (COSE format)
    Browser->>Server: POST /api/auth/register/verify
    Server->>DB: Fetch and consume challenge (single-use)
    Server->>Server: Verify RP ID, Origin binding, & Attestation
    Server->>DB: Save User (NO password) & Credential (Public Key)
    Server->>DB: Create Session Token
    Server-->>Browser: 200 OK (Session Established, Auth Complete)
```

### B. Authentication Flow (Assertion Verification)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client Browser
    participant Authenticator as Hardware Authenticator (TPM/Enclave)
    participant Server as FastAPI Server
    participant DB as SQLite Database

    User->>Browser: Enters Username (or uses Discoverable Passkey)
    Browser->>Server: POST /api/auth/login/options
    Server->>Server: Generate 32-byte Fresh Nonce (Challenge)
    Server->>DB: Store challenge (5m TTL, used=0)
    Server-->>Browser: PublicKeyCredentialRequestOptions (JSON)
    Browser->>Authenticator: navigator.credentials.get(options)
    Authenticator->>User: Prompts for Biometric scan or PIN
    User->>Authenticator: Verifies presence locally
    Authenticator->>Authenticator: Retrieve Private Key for Credential ID
    Authenticator->>Authenticator: Compute ECDSA Digital Signature over (clientDataJSON + authData)
    Authenticator->>Authenticator: Increment Hardware Sign Counter
    Authenticator-->>Browser: Assertion (Signature, AuthenticatorData, ClientData)
    Browser->>Server: POST /api/auth/login/verify
    Server->>DB: Invalidate Challenge immediately (prevent replay)
    Server->>DB: Fetch Stored Public Key & Sign Counter
    Server->>Server: Verify Origin (must match http://localhost:5173)
    Server->>Server: Verify RP ID (must match localhost)
    Server->>Server: Mathematically Verify Digital Signature using Stored Public Key
    Server->>Server: Verify new sign_count > stored sign_count (Cloned key detection)
    Server->>DB: Update sign_count and last_used_at
    Server->>DB: Create Session Token
    Server-->>Browser: 200 OK (Access Granted)
```

---

## 4. Database Schema Design

The SQLite database (`passkey.db`) contains zero password columns by design:

1. **`users` Table**:
   - `id` (VARCHAR(36), PK): UUID.
   - `full_name` (VARCHAR(100)): User display name.
   - `username` (VARCHAR(50), UNIQUE): Normalized alphanumeric handle.
   - `email` (VARCHAR(100), UNIQUE): Email address.
   - `created_at` (DATETIME): Timestamp.
   - `last_login` (DATETIME): Last successful authentication timestamp.

2. **`credentials` Table**:
   - `id` (VARCHAR(36), PK): UUID.
   - `user_id` (VARCHAR(36), FK -> users.id): Cascading foreign key.
   - `credential_id` (BLOB, UNIQUE): Globally unique credential identifier bytes.
   - `public_key` (BLOB): Public key bytes in CBOR/COSE format.
   - `sign_count` (INTEGER): Signature counter to detect cloned authenticators.
   - `transports` (TEXT): JSON array of supported transports (`["internal", "hybrid", "usb"]`).
   - `device_name` (VARCHAR(100)): Device label (e.g. "Work Laptop").
   - `aaguid` (VARCHAR(64)): Authenticator Attestation GUID.
   - `created_at` (DATETIME): Registration timestamp.
   - `last_used_at` (DATETIME): Timestamp of last signature verification.

3. **`auth_challenges` Table**:
   - `id` (VARCHAR(36), PK): UUID.
   - `challenge` (BLOB): 32-byte cryptographic nonce.
   - `username` (VARCHAR(50)): Associated username.
   - `purpose` (VARCHAR(20)): "registration" or "authentication".
   - `created_at` (DATETIME): Timestamp.
   - `expires_at` (DATETIME): TTL timestamp (5 minutes).
   - `used` (INTEGER): Single-use flag (1 = consumed).

4. **`sessions` Table**:
   - `id` (VARCHAR(64), PK): Cryptographic random urlsafe bearer token.
   - `user_id` (VARCHAR(36), FK -> users.id): Associated user.
   - `created_at` (DATETIME): Timestamp.
   - `expires_at` (DATETIME): Session expiration timestamp (7 days).

5. **`auth_logs` Table**:
   - `id` (VARCHAR(36), PK): UUID.
   - `user_id` (VARCHAR(36), FK -> users.id): Associated user.
   - `username` (VARCHAR(50)): Target username.
   - `event_type` (VARCHAR(50)): Event type (REGISTRATION_SUCCESS, LOGIN_SUCCESS, etc.).
   - `status` (VARCHAR(20)): SUCCESS, FAILED.
   - `details` (VARCHAR(255)): Non-sensitive description.
   - `timestamp` (DATETIME): Timestamp.
