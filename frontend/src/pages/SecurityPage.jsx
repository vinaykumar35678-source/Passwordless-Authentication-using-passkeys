import React, { useState } from 'react';
import { 
  Shield, Lock, Key, AlertTriangle, CheckCircle, XCircle, 
  Globe, Server, Smartphone, Cpu, RefreshCw, Terminal, Eye, HelpCircle 
} from 'lucide-react';

export default function SecurityPage() {
  // Educational attack simulation state
  const [phishingSite, setPhishingSite] = useState('evil-bank.com');
  const [phishingResult, setPhishingResult] = useState(null);

  // Brute force simulation state
  const [bruteForceActive, setBruteForceActive] = useState(false);
  const [passwordGuesses, setPasswordGuesses] = useState([]);
  const [passkeyAssertionState, setPasskeyAssertionState] = useState('IDLE');

  const runPhishingSim = (domain) => {
    if (domain === 'example.com') {
      setPhishingResult({
        password: 'Password accepted by server (VULNERABLE)',
        passkey: 'Origin match: "example.com" == RP ID. Digital signature released and verified ✓',
        passkeyStatus: 'SECURE'
      });
    } else {
      setPhishingResult({
        password: 'User typed password into attacker server! Password STOLEN ❌',
        passkey: 'Origin mismatch: Attacker domain "evil-bank.com" != registered RP ID "example.com". Device REFUSES to produce signature! Attack blocked mathematically 🛡️',
        passkeyStatus: 'BLOCKED'
      });
    }
  };

  const runBruteForceSim = async () => {
    setBruteForceActive(true);
    setPasswordGuesses([]);
    setPasskeyAssertionState('RUNNING');

    const fakeDictionary = [
      'password123', 'admin', 'qwerty', 'welcome1', 'football',
      'iloveyou', 'secret', 'hunter2', 'pass1234', 'TargetMatched! ✓'
    ];

    for (let i = 0; i < fakeDictionary.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      const guess = fakeDictionary[i];
      const isMatch = i === fakeDictionary.length - 1;
      setPasswordGuesses(prev => [...prev, { guess, isMatch }]);
    }

    setPasskeyAssertionState('VERIFIED');
    setBruteForceActive(false);
  };

  const faqItems = [
    {
      q: 'What is WebAuthn?',
      a: 'WebAuthn (Web Authentication) is a core component of the FIDO2 standard created by the W3C and FIDO Alliance. It defines a JavaScript browser API that allows web servers to register and authenticate users using asymmetric public-key cryptography instead of passwords.'
    },
    {
      q: 'What is a Passkey?',
      a: 'A passkey is a digital credential built on WebAuthn standards. It consists of a cryptographic keypair (a private key kept on your device and a public key stored on the server). Passkeys replace passwords with biometric (fingerprint/face) or PIN verification on user devices.'
    },
    {
      q: 'What is Public-Key Cryptography?',
      a: 'Unlike symmetric systems where both user and server share the same secret password, asymmetric public-key cryptography uses two mathematically linked keys. The private key signs data and never leaves the device; the public key verifies that signature and can be shared openly without compromising security.'
    },
    {
      q: 'What is a Digital Signature?',
      a: 'A digital signature is a mathematical proof generated using a private key over a specific block of data (the server challenge and origin). Anyone possessing the public key can verify that the data was signed by the legitimate holder of the private key without tampering.'
    },
    {
      q: 'Why Do Passkeys Resist Phishing?',
      a: 'Passkeys enforce strict origin binding. The browser automatically appends the actual web domain (e.g. example.com) to the authentication payload. If a user is tricked into visiting a fraudulent website (e.g. evil-example.com), the device detects that the origin does not match the registered credential and refuses to sign.'
    },
    {
      q: 'Where is the Private Key Stored?',
      a: 'The private key is stored inside tamper-resistant hardware on the user’s device: the Secure Enclave (Apple), TPM (Windows/PC), Titan chip (Google Android), or external YubiKey hardware token. It cannot be extracted via software or transmitted across the internet.'
    },
    {
      q: 'What Data Does the Server Store?',
      a: 'The server stores only: (1) Credential ID, (2) Public Key in COSE format, (3) Monotonically increasing signature counter, and (4) Non-sensitive metadata (e.g. device nickname). The server stores ZERO passwords, ZERO private keys, and ZERO biometric templates.'
    },
    {
      q: 'What Happens During Authentication?',
      a: 'The server sends a random 32-byte cryptographic challenge (nonce). The client browser calls navigator.credentials.get(). The user verifies their presence with biometrics/PIN. The device signs the challenge with the private key and returns the signature. The server verifies the signature with the public key.'
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="badge badge-cyan">
            <Shield size={14} />
            Cybersecurity & Cryptographic Architecture
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Security Analysis & Attack Demonstrations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Explore the mathematical guarantees of WebAuthn and interactive demonstrations 
          illustrating why passkeys make phishing and credential theft obsolete.
        </p>
      </div>

      {/* 1. EDUCATIONAL ATTACK SIMULATION 1: PHISHING (Section 7) */}
      <section className="cyber-card" style={{ padding: '2.25rem', marginBottom: '3rem', border: '1px solid var(--border-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-crimson">Educational Simulation</span>
          <h2 style={{ fontSize: '1.4rem' }}>Attack Demonstration 1 — Origin-Bound Phishing Resistance</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          Test how traditional passwords and WebAuthn passkeys react when a user encounters a legitimate website versus a spoofed phishing website.
        </p>

        {/* Origin Selector */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setPhishingSite('example.com'); runPhishingSim('example.com'); }}
            className={`btn ${phishingSite === 'example.com' ? 'btn-emerald' : 'btn-outline'}`}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            Visit REAL Website: example.com
          </button>
          <button
            onClick={() => { setPhishingSite('evil-bank.com'); runPhishingSim('evil-bank.com'); }}
            className={`btn ${phishingSite === 'evil-bank.com' ? 'btn-danger' : 'btn-outline'}`}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
          >
            Visit PHISHING Website: evil-bank.com
          </button>
        </div>

        {/* Interactive Comparison Result */}
        {phishingResult && (
          <div className="grid-2">
            {/* Password Behavior */}
            <div style={{
              background: phishingSite === 'example.com' ? 'rgba(0,0,0,0.3)' : 'rgba(255, 51, 102, 0.1)',
              border: `1px solid ${phishingSite === 'example.com' ? 'var(--border-subtle)' : 'var(--crimson-neon)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--crimson-neon)', fontSize: '1rem' }}>Password Authentication</strong>
                <span className="badge badge-crimson">Subjective to Phishing</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                User enters: username + password
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {phishingResult.password}
              </p>
            </div>

            {/* Passkey Behavior */}
            <div style={{
              background: 'rgba(0, 230, 118, 0.08)',
              border: '1px solid var(--border-emerald)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--emerald-neon)', fontSize: '1rem' }}>Passkey Authentication</strong>
                <span className="badge badge-emerald">Mathematically Phishing-Proof</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-neon)', marginBottom: '0.75rem' }}>
                Client Origin Binding Enforced
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {phishingResult.passkey}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 2. EDUCATIONAL ATTACK SIMULATION 2: BRUTE FORCE VS PASSKEY (Section 8) */}
      <section className="cyber-card" style={{ padding: '2.25rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-purple">Educational Simulation</span>
          <h2 style={{ fontSize: '1.4rem' }}>Attack Demonstration 2 — Brute-Force & Credential Stuffing</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          Watch how online or offline password cracking operates against a traditional hash versus the mathematical infeasibility of forging an ECDSA 256-bit signature.
        </p>

        <button
          onClick={runBruteForceSim}
          disabled={bruteForceActive}
          className="btn btn-primary"
          style={{ marginBottom: '1.5rem', padding: '0.65rem 1.4rem' }}
        >
          {bruteForceActive ? 'Running Simulation...' : 'Run Cracking Comparison Test'}
        </button>

        <div className="grid-2">
          {/* Left: Password Guessing Simulation */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--crimson-neon)', marginBottom: '0.75rem' }}>
              Traditional Password: Wordlist Attack
            </h3>
            <div style={{
              background: '#04070f',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              {passwordGuesses.length === 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Click 'Run Cracking Comparison Test' to start...</span>
              ) : (
                passwordGuesses.map((p, i) => (
                  <div key={i} style={{ color: p.isMatch ? 'var(--emerald-neon)' : 'var(--crimson-neon)' }}>
                    Guess {i + 1}: "{p.guess}" {p.isMatch ? '-> CRACKED SUCCESSFUL! ❌' : '-> Hash Mismatch ❌'}
                  </div>
                ))
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ⚠️ Passwords can be brute-forced or matched against billions of leaked credential databases.
            </div>
          </div>

          {/* Right: Passkey Challenge-Response */}
          <div style={{
            background: 'rgba(0, 230, 118, 0.05)',
            border: '1px solid var(--border-emerald)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--emerald-neon)', marginBottom: '0.75rem' }}>
              Passkey: 256-bit Elliptic Curve Cryptography
            </h3>
            <div style={{
              background: '#04070f',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <div>Curve: NIST P-256 (secp256r1)</div>
              <div>Key Space: 2^256 combinations (~1.15 × 10^77)</div>
              <div>Challenge: 32 random cryptographically secure bytes</div>
              <div style={{ color: passkeyAssertionState === 'VERIFIED' ? 'var(--emerald-neon)' : 'var(--cyan-neon)', fontWeight: 600, marginTop: '0.5rem' }}>
                {passkeyAssertionState === 'IDLE' && 'STATUS: Standby'}
                {passkeyAssertionState === 'RUNNING' && 'STATUS: Computing ECDSA Assertion...'}
                {passkeyAssertionState === 'VERIFIED' && 'STATUS: ✓ Digital Signature Verified. Unforgeable without private key.'}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              🛡️ Guessing a 256-bit private key would take all supercomputers on Earth billions of years.
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SECURITY INFORMATION QUESTIONS (Section 13) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.75rem', textAlign: 'center' }}>
          Core Security Questions & Conceptual Deep Dive
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {faqItems.map((item, idx) => (
            <div key={idx} className="cyber-card" style={{ padding: '1.75rem' }}>
              <h3 style={{
                fontSize: '1.2rem',
                color: 'var(--cyan-neon)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <HelpCircle size={20} />
                {item.q}
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
