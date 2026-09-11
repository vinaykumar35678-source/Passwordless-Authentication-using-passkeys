import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Server, FileText } from 'lucide-react';

export default function ThreatModelPage() {
  const threatMatrix = [
    {
      threat: 'Phishing Attacks',
      password: 'HIGH RISK (Users enter credentials into fraudulent websites)',
      passkey: 'STRONG RESISTANCE (Cryptographically bound to website origin by browser)',
      details: 'Browsers automatically inject the verified URL into clientDataJSON. Attackers cannot relay passkeys to different domains.'
    },
    {
      threat: 'Password Reuse',
      password: 'MAJOR RISK (Users reuse identical passwords across services)',
      passkey: 'NOT APPLICABLE (Each website origin has a distinct, isolated keypair)',
      details: 'Passkeys for bank.com and shopping.com use entirely distinct mathematical keypairs.'
    },
    {
      threat: 'Credential Stuffing',
      password: 'HIGH RISK (Automated botnets spray leaked password dumps)',
      passkey: 'STRONG RESISTANCE (No passwords exist to dump or spray)',
      details: 'Without physical access to the device authenticator, credential stuffing attacks fail completely.'
    },
    {
      threat: 'Server Database Breach',
      password: 'CATASTROPHIC (Exposes password hashes to offline GPU cracking)',
      passkey: 'NO PASSWORD DATABASE (Server holds only public keys)',
      details: 'Public keys are designed to be public. Stolen public keys cannot be used to forge digital signatures.'
    },
    {
      threat: 'Device Theft',
      password: 'RISK (Attacker can log in from anywhere)',
      passkey: 'STRONG MITIGATION (Protected by local biometric or PIN)',
      details: 'A stolen laptop or phone cannot release passkey signatures without the owner’s biometric match or PIN.'
    },
    {
      threat: 'Man-in-the-Middle (MitM)',
      password: 'VULNERABLE (Depends entirely on TLS certificates)',
      passkey: 'RESISTANT (Cryptographic origin binding & channel IDs)',
      details: 'Even if a rogue TLS proxy decrypts traffic, the signature origin does not match the attacker’s domain.'
    },
    {
      threat: 'Social Engineering',
      password: 'VULNERABLE (Users tricked into revealing passwords via phone/chat)',
      passkey: 'STRONG RESISTANCE (Users cannot speak or text a private key)',
      details: 'Because the user never knows or sees the private key, they cannot inadvertently reveal it to an impostor.'
    }
  ];

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="badge badge-cyan">
            <Shield size={14} />
            Academic Threat Assessment
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Security Threat Model &amp; Risk Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '750px', margin: '0 auto' }}>
          Objective evaluation comparing traditional password vulnerabilities against 
          FIDO2 WebAuthn cryptographic guarantees.
        </p>
      </div>

      {/* Threat Matrix Table */}
      <section className="cyber-card" style={{ padding: '2rem', marginBottom: '3rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Threat Vector</th>
              <th style={{ padding: '1rem', color: 'var(--crimson-neon)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Traditional Password</th>
              <th style={{ padding: '1rem', color: 'var(--emerald-neon)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Passkey / WebAuthn</th>
            </tr>
          </thead>
          <tbody>
            {threatMatrix.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: 'var(--text-primary)', verticalAlign: 'top', width: '22%' }}>
                  {item.threat}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.35rem' }}>
                    {item.details}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: '#fca5a5', verticalAlign: 'top', width: '38%', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--crimson-neon)' }}>❌</span>
                    <span>{item.password}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: '#86efac', verticalAlign: 'top', width: '40%', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--emerald-neon)' }}>✅</span>
                    <span>{item.passkey}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Academic Nuance & Limitations Section */}
      <section className="cyber-card" style={{ padding: '2rem', border: '1px solid var(--border-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <AlertTriangle size={22} color="var(--amber-neon)" />
          <h2 style={{ fontSize: '1.3rem' }}>
            Academic Disclosure: Defense in Depth &amp; Realistic Limitations
          </h2>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          While passkeys eliminate authentication-layer vulnerabilities (phishing, password theft, credential stuffing, and brute force), 
          they do <strong>not</strong> make an application immune to every security risk. A rigorous cybersecurity posture requires defense in depth:
        </p>

        <div className="grid-2">
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--cyan-neon)' }}>1. TLS / HTTPS Security</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              WebAuthn requires HTTPS. Broken TLS or compromised root CAs could allow attackers to manipulate client code before the WebAuthn API executes.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--cyan-neon)' }}>2. Endpoint Malware / Session Hijacking</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              If a client machine is infected with infostealer malware, the attacker can hijack session cookies after the user successfully authenticates.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--cyan-neon)' }}>3. Account Recovery Flaws</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              If a service allows users to recover accounts via insecure SMS or security questions, attackers will bypass passkeys by attacking the recovery mechanism.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--cyan-neon)' }}>4. Server-Side Infrastructure Hardening</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Servers must securely handle session storage, prevent SQL injection, maintain least privilege, and sanitize inputs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
