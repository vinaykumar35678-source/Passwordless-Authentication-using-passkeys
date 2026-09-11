import React from 'react';
import { Shield, Lock, Cpu, Globe, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#04070f',
      borderTop: '1px solid var(--border-subtle)',
      padding: '2.5rem 1.5rem',
      fontSize: '0.85rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            marginBottom: '0.35rem'
          }}>
            <Shield size={16} color="var(--cyan-neon)" />
            Passwordless Authentication Using Passkeys & WebAuthn
          </div>
          <p style={{ maxWidth: '550px' }}>
            Academic Cryptography & Cybersecurity Seminar Project demonstrating genuine asymmetric 
            public-key authentication, hardware-backed authenticators, and phishing-resistant origin binding.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-neon)' }}>
            <CheckCircle size={14} />
            <span>0 Passwords Stored</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-neon)' }}>
            <Cpu size={14} />
            <span>W3C WebAuthn Level 3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c77dff' }}>
            <Lock size={14} />
            <span>FIDO2 / NIST AAL3</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
