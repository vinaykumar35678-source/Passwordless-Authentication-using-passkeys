import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Key, Fingerprint, Lock, CheckCircle, XCircle, ArrowRight, 
  Smartphone, Laptop, RefreshCw, AlertTriangle, Cpu, Zap, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, webAuthnSupported, platformAuthAvailable, systemStats } = useAuth();
  const [activeTab, setActiveTab] = useState('passkey');

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            <Cpu size={14} />
            Cryptography & Cybersecurity Academic Seminar Project
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
          lineHeight: 1.1,
          marginBottom: '1.25rem',
          background: 'linear-gradient(135deg, #ffffff 40%, #00f0ff 85%, #9d4edd 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Passwordless Authentication
        </h1>

        <p style={{
          fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          marginBottom: '0.75rem'
        }}>
          “Your identity. Your device. No password.”
        </p>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem'
        }}>
          Secure authentication using WebAuthn and public-key cryptography.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-emerald" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              <Fingerprint size={20} />
              Open Security Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                <Key size={20} />
                Create a Passkey
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                <Fingerprint size={20} />
                Sign in with Passkey
              </Link>
            </>
          )}
          <Link to="/demo" className="btn btn-outline" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem', borderColor: 'var(--purple-neon)' }}>
            <Zap size={20} color="var(--purple-neon)" />
            Live Demo
          </Link>
          <Link to="/seminar" className="btn btn-outline" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem', borderColor: 'var(--amber-neon)' }}>
            <GraduationCap size={20} color="var(--amber-neon)" />
            🎓 Seminar Mode
          </Link>
        </div>

        {/* Core Educational Statement Banner */}
        <div className="cyber-card" style={{
          maxWidth: '860px',
          margin: '0 auto 3.5rem',
          padding: '1.5rem 2rem',
          background: 'rgba(0, 240, 255, 0.05)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={22} color="var(--cyan-neon)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--cyan-neon)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Core Cryptographic Principle
            </span>
          </div>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            “Your private cryptographic key stays protected on your device. 
            The server stores the corresponding public key and uses it to verify your authentication.”
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            🔒 Biometrics (fingerprint/face) never leave your device. The server receives zero passwords and zero biometric data.
          </div>
        </div>

        {/* Visual Authentication Chain (User -> Device Authenticator -> Cryptographic Signature -> Server Verification -> Secure Access) */}
        <div className="cyber-card" style={{ maxWidth: '1000px', margin: '0 auto 4rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Authentication Flow Pipeline
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {[
              { icon: <Laptop size={22} color="var(--cyan-neon)" />, label: 'User' },
              { icon: <Fingerprint size={22} color="var(--emerald-neon)" />, label: 'Device Authenticator' },
              { icon: <Lock size={22} color="var(--purple-neon)" />, label: 'Cryptographic Signature' },
              { icon: <Cpu size={22} color="var(--cyan-neon)" />, label: 'Server Verification' },
              { icon: <CheckCircle size={22} color="var(--emerald-neon)" />, label: 'Secure Access' },
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div style={{
                  background: 'rgba(8, 14, 28, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  minWidth: '170px'
                }}>
                  {node.icon}
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{node.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ color: 'var(--cyan-neon)', fontWeight: 700, fontSize: '1.2rem' }}>↓</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE PROPOSITION CARDS */}
      <section style={{ marginBottom: '4.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2.5rem' }}>
          Engineered for Total Security
        </h2>

        <div className="grid-4">
          <div className="cyber-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid var(--border-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Shield size={24} color="var(--cyan-neon)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>🔐 Phishing Resistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Authentication is bound to the website origin.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(0, 230, 118, 0.1)',
              border: '1px solid var(--border-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Key size={24} color="var(--emerald-neon)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>🔑 No Password</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Users authenticate without manually entering passwords.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(157, 78, 221, 0.1)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Lock size={24} color="var(--purple-neon)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>🛡️ Private Key Protection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              The private key remains protected by the authenticator/device.
            </p>
          </div>

          <div className="cyber-card" style={{ padding: '1.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255, 171, 0, 0.1)',
              border: '1px solid rgba(255, 171, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Zap size={24} color="var(--amber-neon)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>⚡ Fast Authentication</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Use fingerprint, face authentication, PIN, or device authentication where supported.
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PASSWORD VS PASSKEY COMPARISON */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
            Password vs. Passkey Architecture
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
            Compare the structural differences between vulnerable shared-secret passwords 
            and mathematically unbreakable public-key passkeys.
          </p>
        </div>

        <div className="grid-2">
          {/* Traditional Password Card */}
          <div className="cyber-card" style={{
            padding: '2rem',
            border: '1px solid rgba(255, 51, 102, 0.3)',
            background: 'rgba(20, 10, 18, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--crimson-neon)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={22} />
                Traditional Password
              </h3>
              <span className="badge badge-crimson">Shared Secret Flaw</span>
            </div>

            {/* Architecture pipeline */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.8
            }}>
              Username<br />
              ↓ (Plaintext / Hash)<br />
              Password over Network<br />
              ↓<br />
              Server Application<br />
              ↓<br />
              Password Database (Salted Hash Table)<br />
              ↓<br />
              Authentication
            </div>

            <h4 style={{ fontSize: '0.95rem', color: 'var(--crimson-neon)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Critical Security Problems:
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Phishing', desc: 'Attacker tricks user into typing the password on a clone site.' },
                { label: 'Password Reuse', desc: 'Breach on site A compromises account on site B.' },
                { label: 'Credential Stuffing', desc: 'Automated bots test millions of leaked passwords.' },
                { label: 'Database Breaches', desc: 'If the server database leaks, passwords can be cracked offline.' },
                { label: 'Weak Passwords', desc: 'Humans choose predictable phrases and memorable patterns.' },
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--crimson-neon)', fontWeight: 'bold' }}>❌</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.label}:</strong> {item.desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Passkey Card */}
          <div className="cyber-card" style={{
            padding: '2rem',
            border: '1px solid rgba(0, 230, 118, 0.35)',
            background: 'rgba(8, 24, 20, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--emerald-neon)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={22} />
                Passkey Authentication
              </h3>
              <span className="badge badge-emerald">Asymmetric Cryptography</span>
            </div>

            {/* Architecture pipeline */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--emerald-neon)',
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: 1.8
            }}>
              Username<br />
              ↓<br />
              Challenge<br />
              ↓<br />
              Authenticator<br />
              ↓<br />
              User Verification<br />
              ↓<br />
              Digital Signature<br />
              ↓<br />
              Public Key Verification<br />
              ↓<br />
              Authentication
            </div>

            <h4 style={{ fontSize: '0.95rem', color: 'var(--emerald-neon)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Cryptographic Guarantees:
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { label: 'Phishing Resistant', desc: 'Signature binds to browser domain. Malicious sites receive invalid signatures.' },
                { label: 'No Password Database', desc: 'Server stores ONLY public keys. Stealing public keys grants zero login power.' },
                { label: 'Public-Key Cryptography', desc: 'Mathematical assurance using NIST P-256 ECDSA and Ed25519 algorithms.' },
                { label: 'Private Key Stays Protected', desc: 'Enclosed inside Secure Enclave/TPM chip and never transmitted.' },
                { label: 'Strong Device Authentication', desc: 'Local biometric or PIN verification required before signature release.' },
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--emerald-neon)', fontWeight: 'bold' }}>✅</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.label}:</strong> {item.desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HARDWARE COMPATIBILITY DIAGNOSTIC */}
      <section className="cyber-card" style={{ padding: '2rem', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={22} color="var(--cyan-neon)" />
              Real-Time Browser & Hardware Capability
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Live query of your client browser environment using the W3C WebAuthn API.
            </p>
          </div>
          <div className={`badge ${webAuthnSupported ? 'badge-emerald' : 'badge-crimson'}`} style={{ padding: '0.5rem 1rem' }}>
            <div className="pulse-dot" style={{ background: webAuthnSupported ? 'var(--emerald-neon)' : 'var(--crimson-neon)' }} />
            {webAuthnSupported ? 'Passkey Compatible' : 'Incompatible Client'}
          </div>
        </div>

        <div className="grid-3">
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              {webAuthnSupported ? <CheckCircle size={18} color="var(--emerald-neon)" /> : <XCircle size={18} color="var(--crimson-neon)" />}
              <strong>WebAuthn API</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              window.PublicKeyCredential available in DOM
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              {window.isSecureContext ? <CheckCircle size={18} color="var(--emerald-neon)" /> : <XCircle size={18} color="var(--crimson-neon)" />}
              <strong>Secure Context</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Running on HTTPS or verified localhost
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              {platformAuthAvailable ? <CheckCircle size={18} color="var(--emerald-neon)" /> : <AlertTriangle size={18} color="var(--amber-neon)" />}
              <strong>Platform Authenticator</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {platformAuthAvailable ? 'Windows Hello / Touch ID / PIN active' : 'Roaming key (USB/NFC) or software'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
