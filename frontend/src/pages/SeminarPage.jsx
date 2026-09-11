import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, ChevronLeft, ChevronRight, Zap, Shield, Key, 
  Lock, CheckCircle, XCircle, ArrowRight, Laptop, Server, Cpu 
} from 'lucide-react';

export default function SeminarPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      num: '01',
      title: 'The Password Crisis',
      subtitle: 'Why 60-year-old password authentication is failing modern cybersecurity',
      points: [
        'Over 80% of data breaches involve weak, stolen, or reused passwords.',
        'Users suffer from password fatigue, creating predictable patterns and reusing them across services.',
        'Credential stuffing bots automatically test billions of leaked passwords against high-value targets.',
        'Phishing remains the #1 initial attack vector because passwords can be tricked out of users.'
      ],
      diagram: (
        <div style={{ background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--crimson-neon)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--crimson-neon)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Traditional Flaw: Shared Secret
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            User Device ───[Password over Internet]───&gt; Server Database (Target for Leaks)
          </div>
        </div>
      )
    },
    {
      num: '02',
      title: 'Traditional Authentication Architecture',
      subtitle: 'Understanding the shared-secret vulnerability',
      points: [
        'The user creates a secret string and shares it with the server.',
        'The server hashes the secret (bcrypt, argon2) and stores the hash.',
        'Every login transmits the password across the network to be re-hashed.',
        'Single point of failure: If the database leaks, offline GPU rigs crack billions of hashes per second.'
      ],
      diagram: (
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          User enters "Secret123" ──&gt; Server checks against hash table ──&gt; Vulnerable to MITM, Phishing &amp; Breaches
        </div>
      )
    },
    {
      num: '03',
      title: 'The Passkey Revolution',
      subtitle: 'Replacing shared secrets with asymmetric cryptography',
      points: [
        'A passkey is a pair of cryptographic keys created on the user’s personal device.',
        'The Private Key is locked inside the hardware Secure Enclave / TPM and NEVER leaves the device.',
        'The Public Key is registered on the server and is completely useless to an attacker.',
        'Zero passwords exist to be phished, stolen, leaked, or brute-forced.'
      ],
      diagram: (
        <div style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--border-emerald)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--emerald-neon)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Zero-Password Paradigm
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Private Key (Hardware Only 🔒) ⟷ Public Key (Server Database ✓)
          </div>
        </div>
      )
    },
    {
      num: '04',
      title: 'WebAuthn & FIDO2 Standards',
      subtitle: 'Open, vendor-neutral web security specification',
      points: [
        'WebAuthn is an official W3C web standard supported natively in Chrome, Safari, Edge, and Firefox.',
        'FIDO2 combines W3C WebAuthn (browser-to-server) and CTAP2 (device-to-authenticator).',
        'Works with platform authenticators (Windows Hello, Apple Touch ID, Android Biometrics) and security keys (YubiKeys).',
        'NIST AAL3 compliant: Strongest level of authentication assurance available.'
      ],
      diagram: (
        <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          W3C WebAuthn JavaScript API ⟵ FIDO2 Standard ⟶ Hardware Authenticator
        </div>
      )
    },
    {
      num: '05',
      title: 'The Cryptography Behind Passkeys',
      subtitle: 'ECDSA Elliptic Curve Digital Signatures (NIST P-256 / Ed25519)',
      points: [
        'Server sends a random 32-byte cryptographic challenge (nonce).',
        'The private key computes an elliptic curve digital signature over the challenge.',
        'The server uses the public key to mathematically verify that the legitimate private key produced the signature.',
        'Replay Protection: Because challenges expire and are single-use, intercepted signatures are useless.'
      ],
      diagram: (
        <div style={{ background: '#040710', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          Challenge + Origin ──[Private Key Sign]──&gt; Digital Signature ──[Public Key Verify]──&gt; VALID ✓
        </div>
      )
    },
    {
      num: '06',
      title: 'WebAuthn Registration Lifecycle',
      subtitle: 'How a new passkey is created and anchored',
      points: [
        'Step 1: User enters account info. Server returns PublicKeyCredentialCreationOptions + challenge.',
        'Step 2: Browser invokes navigator.credentials.create().',
        'Step 3: Device prompts user for biometric scan (fingerprint/face) or PIN.',
        'Step 4: Secure Enclave generates a unique keypair; public key is sent back in attestation object.',
        'Step 5: Backend verifies challenge, RP ID, and origin, then stores the public key.'
      ],
      diagram: (
        <div style={{ background: 'rgba(8, 20, 35, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          Browser Request ⟶ Challenge ⟶ Biometric Verification ⟶ Keypair Generated ⟶ Public Key Stored
        </div>
      )
    },
    {
      num: '07',
      title: 'WebAuthn Authentication Lifecycle',
      subtitle: 'How users sign in without typing a password',
      points: [
        'Step 1: User requests login. Server returns fresh random challenge.',
        'Step 2: Browser invokes navigator.credentials.get().',
        'Step 3: User touches fingerprint sensor or looks at camera.',
        'Step 4: Authenticator signs clientData + authenticatorData with private key.',
        'Step 5: Server verifies signature against stored public key and increments sign counter.'
      ],
      diagram: (
        <div style={{ background: 'rgba(8, 20, 35, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          Login Trigger ⟶ Nonce ⟶ Fingerprint Check ⟶ Assertion Signature ⟶ Verified Access
        </div>
      )
    },
    {
      num: '08',
      title: 'Security Advantages Summary',
      subtitle: 'Eliminating the entire threat landscape of credentials',
      points: [
        'Phishing Immune: Origin binding ensures authenticators never sign on wrong domains.',
        'Breach Proof: A leaked server database contains only harmless public keys.',
        'No Credential Stuffing: Bots cannot automate logins without hardware biometric presence.',
        'Frictionless UX: Log in in 500ms with a fingerprint instead of memorizing 16-character passwords.'
      ],
      diagram: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-emerald)', color: 'var(--emerald-neon)' }}>
            ✓ Phishing Resistant<br />✓ Zero Stored Passwords
          </div>
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glow)', color: 'var(--cyan-neon)' }}>
            ✓ Hardware Isolated<br />✓ NIST AAL3 Compliant
          </div>
        </div>
      )
    },
    {
      num: '09',
      title: 'Live System Demonstration',
      subtitle: 'Witnessing genuine WebAuthn authentication in action',
      points: [
        'We will now run the live application to demonstrate registration, login, and verification.',
        'Observe the actual prompt from Windows Hello / Touch ID requesting user presence.',
        'Inspect the server SQLite database to prove that ZERO password columns exist.',
        'Review the audit telemetry capturing challenge generation and signature validation.'
      ],
      diagram: (
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <Link to="/demo" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <Zap size={20} />
            Launch Live Protocol Demo
          </Link>
        </div>
      )
    },
    {
      num: '10',
      title: 'Conclusion & Future Outlook',
      subtitle: 'The future of cybersecurity is passwordless',
      points: [
        'Public-key cryptography successfully solves the foundational flaw of the modern internet.',
        'Passkeys provide unmatched security without degrading user convenience.',
        'Future Scope: Cross-device passkeys, enterprise SSO sync, hardware token enforcement, and Zero-Trust architecture.',
        'Thank you! Questions and Viva defense discussion.'
      ],
      diagram: (
        <div style={{ background: 'rgba(157, 78, 221, 0.15)', border: '1px solid var(--purple-neon)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d8b4fe' }}>
            Authentication Solved with Pure Mathematics
          </div>
        </div>
      )
    }
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((p) => Math.min(slides.length - 1, p + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Slide Navigation Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-purple" style={{ fontSize: '0.85rem' }}>
            <GraduationCap size={15} />
            Seminar Slide Mode
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Slide {slide.num} of {slides.length}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
            disabled={currentSlide === 0}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
            disabled={currentSlide === slides.length - 1}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide Thumbnails / Pills */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {slides.map((s, idx) => (
          <button
            key={s.num}
            onClick={() => setCurrentSlide(idx)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: currentSlide === idx ? 'rgba(157, 78, 221, 0.3)' : 'rgba(0,0,0,0.3)',
              border: currentSlide === idx ? '1px solid var(--purple-neon)' : '1px solid var(--border-subtle)',
              color: currentSlide === idx ? '#fff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {s.num} — {s.title.substring(0, 15)}...
          </button>
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="cyber-card" style={{
        padding: '3rem 2.5rem',
        minHeight: '520px',
        border: '1px solid var(--purple-neon)',
        boxShadow: '0 0 35px rgba(157, 78, 221, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ color: 'var(--purple-neon)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            SECTION {slide.num}
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {slide.title}
          </h1>
          <p style={{ color: 'var(--cyan-neon)', fontSize: '1.2rem', marginBottom: '2rem', fontWeight: 500 }}>
            {slide.subtitle}
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {slide.points.map((pt, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--cyan-neon)', fontWeight: 'bold' }}>▸</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Slide Visual Diagram */}
        <div>
          {slide.diagram}
        </div>
      </div>
    </div>
  );
}
