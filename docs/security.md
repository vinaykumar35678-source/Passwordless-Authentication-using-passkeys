# Cybersecurity & Cryptographic Security Model

## 1. Threat Model & Mitigations

| Threat Vector | Traditional Password Architecture | WebAuthn / Passkey Architecture | Mitigation Mechanism |
| :--- | :--- | :--- | :--- |
| **Phishing / Credential Harvesting** | **Critical Vulnerability**: Users are easily duped into typing passwords onto adversary-controlled replica domains. | **Mathematically Immune**: Browser extracts verified TLS origin and injects it into `clientDataJSON`. | Even if a user visits `evil-bank.com`, the authenticator signs for `evil-bank.com`, which the legitimate server `bank.com` rejects immediately. |
| **Credential Stuffing** | **High Risk**: Automated bots replay username/password pairs scraped from breaches across other websites. | **Strong Resistance**: No shared secrets exist. Each origin possesses a distinct, mathematically independent keypair. | Automated bot attacks fail because private keys cannot be automated or transmitted across the web without hardware presence. |
| **Server Database Compromise** | **Catastrophic Exposure**: Stolen password hash tables (MD5, SHA-256, bcrypt) are targeted with GPU clusters. | **No Password Database**: The server database contains only public keys. | Public keys are mathematically incapable of generating digital signatures. A leaked database grants zero access to attackers. |
| **Replay Attacks** | **Risk**: Intercepted passwords or hashes can be resent by adversaries to authenticate. | **Strong Resistance**: Server-generated cryptographic nonces (challenges) expire in 5 minutes and are single-use. | Replaying an intercepted signature is rejected because the associated challenge is marked `used = 1` immediately. |
| **Authenticator Cloning** | **Risk**: Physical extraction or emulation of private key material. | **Monotonically Increasing Counter**: Every assertion increments an internal hardware counter. | If an authentic key signs with counter 50, but a cloned key presents counter 20, the backend immediately flags and rejects the anomaly. |
| **Eavesdropping / MITM** | **Risk**: Passwords intercepted over unencrypted channels or intercepted via rogue TLS proxies. | **Cryptographic Origin & RP ID Binding**: Signatures bind directly to the Relying Party ID. | Signatures are cryptographically bound to the RP ID. Rogue proxies cannot forge a valid signature for the authentic domain. |

---

## 2. Cryptographic Implementation Details

### A. Algorithm Suite (COSE Identifiers)
The system supports the following W3C COSE (CBOR Object Signing and Encryption) algorithms:
- **`ES256` (-7)**: ECDSA using the **NIST P-256** (secp256r1) elliptic curve combined with **SHA-256**. This is the primary algorithm supported by Windows Hello, Apple Secure Enclave, and Android Titan M2.
- **`EdDSA` (-8)**: Ed25519 Twisted Edwards curve algorithm offering high performance and natural resistance to side-channel timing attacks.
- **`RS256` (-257)**: RSASSA-PKCS1-v1_5 with a 2048-bit modulus and SHA-256 digest, providing legacy support for enterprise security tokens.

### B. Challenge Verification Formula
During authentication, the hardware authenticator computes the signature:
$$\text{Signature} = \text{Sign}_{K_{\text{private}}}(\text{AuthenticatorData} \mathbin{\Vert} \text{SHA-256}(\text{clientDataJSON}))$$

The backend server verifies the signature using the stored public key $K_{\text{public}}$:
$$\text{Verify}_{K_{\text{public}}}(\text{AuthenticatorData} \mathbin{\Vert} \text{SHA-256}(\text{clientDataJSON}), \text{Signature}) \stackrel{?}{=} \text{TRUE}$$

If and only if the verification evaluates to $\text{TRUE}$, the RP ID matches `localhost`, the origin matches `http://localhost:5173`, and the challenge matches the issued single-use nonce, the session token is issued.

---

## 3. Privacy & Biometric Guarantees

1. **Biometrics Never Leave the Device**:
   - The user's fingerprint, facial scan, or PIN is evaluated exclusively by local hardware (Apple Touch ID / Face ID, Windows Hello TPM).
   - Biometric templates are never converted to data packets, never stored in memory, and never transmitted across the network.
   - The server receives only an assertion: a digital signature that proves the user authorized the transaction.

2. **No Cross-Site Tracking**:
   - WebAuthn credentials generated for domain A cannot be linked or correlated with credentials generated for domain B.
   - Credential IDs and public keys are cryptographically isolated per Relying Party ID (RP ID).
