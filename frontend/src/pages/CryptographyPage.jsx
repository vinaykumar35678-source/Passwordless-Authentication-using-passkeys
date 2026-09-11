import React, { useState } from 'react';
import { 
  Key, Shield, Lock, CheckCircle, XCircle, RefreshCw, 
  ArrowDown, ArrowRight, Cpu, Sparkles, Terminal, AlertTriangle 
} from 'lucide-react';

export default function CryptographyPage() {
  // Interactive Web Crypto Playground state
  const [challengeText, setChallengeText] = useState('University-Seminar-Random-Challenge-Nonce-98234');
  const [keyPair, setKeyPair] = useState(null);
  const [signatureHex, setSignatureHex] = useState('');
  const [publicKeyHex, setPublicKeyHex] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tamperMessage, setTamperMessage] = useState(false);

  // Generate live ECDSA keypair using native browser Web Crypto API
  const handleGenerateKeypair = async () => {
    setIsGenerating(true);
    setVerificationResult(null);
    try {
      const keys = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, // Private key NOT extractable (mirrors hardware Secure Enclave protection)
        ['sign', 'verify']
      );

      // Export public key to SPKI format
      const spki = await window.crypto.subtle.exportKey('spki', keys.publicKey);
      const pubHex = Array.from(new Uint8Array(spki)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setKeyPair(keys);
      setPublicKeyHex(pubHex);

      // Sign the challenge
      const enc = new TextEncoder();
      const sig = await window.crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        keys.privateKey,
        enc.encode(challengeText)
      );
      const sHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
      setSignatureHex(sHex);
    } catch (err) {
      console.error('Crypto error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Verify signature with public key
  const handleVerify = async (tampered) => {
    if (!keyPair) return;
    const enc = new TextEncoder();
    const dataToVerify = tampered ? (challengeText + '-TAMPERED') : challengeText;
    
    try {
      // Convert hex signature back to bytes
      const rawSig = new Uint8Array(signatureHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const isValid = await window.crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        keyPair.publicKey,
        rawSig,
        enc.encode(dataToVerify)
      );
      setVerificationResult(isValid ? 'VALID' : 'INVALID');
    } catch (err) {
      setVerificationResult('INVALID');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="badge badge-purple">
            <Key size={14} />
            Public-Key Asymmetric Cryptography
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          How Public-Key Cryptography Protects Your Passkey
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto' }}>
          Passkeys eliminate shared secrets. The user device signs challenge data with an unextractable 
          private key, while the server verifies authenticity using the mathematical public key.
        </p>
      </div>

      {/* 1. SECTION 4 VISUAL CRYPTOGRAPHY FLOW DIAGRAM */}
      <section className="cyber-card" style={{ padding: '2.5rem', marginBottom: '3rem', border: '1px solid var(--border-glow)' }}>
        <h2 style={{ fontSize: '1.3rem', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Asymmetric Key Pair Architecture
        </h2>

        {/* Responsive ASCII / SVG Diagram */}
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          background: '#040710',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          fontFamily: 'var(--font-mono)'
        }}>
          {/* Top: Key Pair */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(157, 78, 221, 0.2)',
              border: '1px solid var(--purple-neon)',
              padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              color: '#d8b4fe'
            }}>
              KEY PAIR (ECDSA P-256)
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem' }}>│</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>┌──────────────────┴──────────────────┐</div>
          </div>

          {/* Middle: Private vs Public */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            {/* Left: Private Key */}
            <div style={{
              background: 'rgba(25, 12, 35, 0.7)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--purple-neon)', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                PRIVATE KEY 🔒
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Device Hardware Only (Secure Enclave)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0' }}>↓</div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--cyan-neon)' }}>
                Sign Challenge
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0' }}>↓</div>
              <div style={{ fontWeight: 700, color: 'var(--emerald-neon)', fontSize: '0.95rem' }}>
                DIGITAL SIGNATURE
              </div>
            </div>

            {/* Right: Public Key */}
            <div style={{
              background: 'rgba(8, 20, 35, 0.7)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--cyan-neon)', fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                PUBLIC KEY 🌐
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stored on FastAPI Server Database</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0' }}>↓</div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Verification Engine
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0.5rem 0' }}>↓</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                MATHEMATICAL CHECK
              </div>
            </div>
          </div>

          {/* Bottom: Signature Transmission & Result */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--emerald-neon)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              SIGNATURE ───────────(Transmitted Over Network)───────────&gt; VERIFY (Public Key)
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>┌──────────┴──────────┐</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3.5rem', margin: '0.5rem 0' }}>
              <div style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>▼ VALID</div>
              <div style={{ color: 'var(--crimson-neon)', fontWeight: 700 }}>▼ INVALID</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3.5rem' }}>
              <div style={{ color: 'var(--emerald-neon)', fontSize: '0.85rem' }}>LOGIN GRANTED ✓</div>
              <div style={{ color: 'var(--crimson-neon)', fontSize: '0.85rem' }}>REJECTED ❌</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          ⚠️ Notice: The private key is NEVER transmitted across the network and NEVER displayed or stored on the server.
        </div>
      </section>

      {/* 2. INTERACTIVE CRYPTOGRAPHIC PLAYGROUND */}
      <section className="cyber-card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sparkles size={22} color="var(--cyan-neon)" />
          <h2 style={{ fontSize: '1.4rem' }}>Live Client-Side Cryptography Simulator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
          Test ECDSA P-256 signing right now using your browser's native Web Crypto engine. 
          Generate a real keypair, sign the challenge, and test tamper detection.
        </p>

        {/* Input challenge */}
        <div className="form-group">
          <label className="form-label">Server Cryptographic Challenge (Nonce)</label>
          <input
            type="text"
            className="form-input"
            value={challengeText}
            onChange={(e) => setChallengeText(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleGenerateKeypair}
            disabled={isGenerating}
            className="btn btn-primary"
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
            Generate ECDSA Keypair & Sign Challenge
          </button>

          {keyPair && (
            <>
              <button
                onClick={() => handleVerify(false)}
                className="btn btn-emerald"
              >
                <CheckCircle size={16} />
                Verify Legitimate Signature
              </button>

              <button
                onClick={() => handleVerify(true)}
                className="btn btn-danger"
              >
                <XCircle size={16} />
                Test Tampered Challenge (Simulate Attack)
              </button>
            </>
          )}
        </div>

        {/* Verification Result Banner */}
        {verificationResult && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.75rem',
            background: verificationResult === 'VALID' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 51, 102, 0.15)',
            border: `1px solid ${verificationResult === 'VALID' ? 'var(--emerald-neon)' : 'var(--crimson-neon)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {verificationResult === 'VALID' ? (
              <CheckCircle size={24} color="var(--emerald-neon)" />
            ) : (
              <XCircle size={24} color="var(--crimson-neon)" />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: verificationResult === 'VALID' ? 'var(--emerald-neon)' : 'var(--crimson-neon)' }}>
                VERIFICATION RESULT: {verificationResult}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {verificationResult === 'VALID'
                  ? 'The signature matches the challenge and public key perfectly. Authentication authorized.'
                  : 'Signature verification rejected! The challenge data or signature was modified in transit. Access denied.'}
              </div>
            </div>
          </div>
        )}

        {/* Cryptographic Key Inspect Boxes */}
        {keyPair && (
          <div className="grid-2">
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan-neon)', fontWeight: 600, marginBottom: '0.35rem' }}>
                EXPORTED PUBLIC KEY (SPKI HEX FORMAT):
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                background: '#04070f',
                padding: '0.75rem',
                borderRadius: '4px',
                wordBreak: 'break-all',
                color: 'var(--text-secondary)',
                maxHeight: '110px',
                overflowY: 'auto'
              }}>
                {publicKeyHex}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--purple-neon)', fontWeight: 600, marginBottom: '0.35rem' }}>
                COMPUTED DIGITAL SIGNATURE (ECDSA P-256):
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                background: '#04070f',
                padding: '0.75rem',
                borderRadius: '4px',
                wordBreak: 'break-all',
                color: 'var(--text-secondary)',
                maxHeight: '110px',
                overflowY: 'auto'
              }}>
                {signatureHex}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. MATHEMATICAL SPECIFICATIONS FOR SEMINAR */}
      <section className="cyber-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--cyan-neon)' }}>
          Mathematical Specifications (COSE Algorithms)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>ES256 (COSE Identifier: -7)</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              ECDSA over NIST P-256 curve with SHA-256 digest. Hardware standard for Apple TouchID/FaceID and Windows Hello.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>EdDSA (COSE Identifier: -8)</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              Ed25519 Twisted Edwards curve. Immune to side-channel timing attacks and offers high performance.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <strong>RS256 (COSE Identifier: -257)</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              RSASSA-PKCS1-v1_5 with 2048-bit modulus and SHA-256. Legacy enterprise smart cards and security tokens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
