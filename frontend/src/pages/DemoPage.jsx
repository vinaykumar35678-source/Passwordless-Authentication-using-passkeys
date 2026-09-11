import React, { useState } from 'react';
import { 
  Zap, Play, CheckCircle, Clock, AlertCircle, ArrowRight, 
  RotateCcw, Shield, Laptop, Server, Key, Lock, Fingerprint 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DemoPage() {
  const { user, loginWithPasskey, webAuthnSupported } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [demoLog, setDemoLog] = useState([]);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [usernameInput, setUsernameInput] = useState(user?.username || '');

  const demoSteps = [
    { id: 1, title: '1. Login Request', actor: 'Client Browser', desc: 'Browser transmits username/email requesting an authentication challenge.' },
    { id: 2, title: '2. Server Challenge', actor: 'FastAPI Server', desc: 'Server generates cryptographically secure 32-byte nonce (single-use, 5m TTL).' },
    { id: 3, title: '3. Browser WebAuthn API', actor: 'Browser Engine', desc: 'Browser invokes navigator.credentials.get() with PublicKeyCredentialRequestOptions.' },
    { id: 4, title: '4. User Verification', actor: 'Device Authenticator', desc: 'Hardware prompts user for Fingerprint, Face ID, or PIN. Biometrics stay local.' },
    { id: 5, title: '5. Cryptographic Signature', actor: 'Secure Enclave / TPM', desc: 'Private key signs authenticatorData + SHA-256(clientDataJSON).' },
    { id: 6, title: '6. Server Verification', actor: 'FastAPI Backend', desc: 'Server uses stored public key to verify signature, checks origin and RP ID.' },
    { id: 7, title: '7. Authentication Success', actor: 'Identity Provider', desc: 'Signature matches! Secure session established with zero passwords ever stored.' },
  ];

  const getStepStatus = (index) => {
    if (activeStepIndex > index) return 'completed';
    if (activeStepIndex === index) return 'processing';
    return 'waiting';
  };

  const handleStartLiveDemo = async () => {
    setIsRunning(true);
    setDemoSuccess(false);
    setDemoError('');
    setDemoLog([]);

    // Step 1: Login Request
    setActiveStepIndex(0);
    setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 1: Browser initiated login request for '${usernameInput || 'discoverable passkey'}'`]);
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Server Challenge
    setActiveStepIndex(1);
    setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 2: Server generated 32-byte cryptographic challenge nonce`]);
    await new Promise(r => setTimeout(r, 600));

    // Step 3: Browser WebAuthn API
    setActiveStepIndex(2);
    setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 3: Browser dispatched navigator.credentials.get()`]);
    await new Promise(r => setTimeout(r, 400));

    // Step 4: User Verification & Step 5: Signature
    setActiveStepIndex(3);
    setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 4: Device prompted user for biometric/PIN verification...`]);

    try {
      // Execute genuine WebAuthn authentication via AuthContext
      await loginWithPasskey(usernameInput.trim() || undefined);

      setActiveStepIndex(4);
      setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 5: Hardware Secure Enclave signed challenge with device private key`]);
      await new Promise(r => setTimeout(r, 500));

      // Step 6: Server verification
      setActiveStepIndex(5);
      setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 6: FastAPI server verified ECDSA signature with stored public key`]);
      await new Promise(r => setTimeout(r, 500));

      // Step 7: Success
      setActiveStepIndex(6);
      setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Step 7: ✓ Authentication verified cryptographically. Session established!`]);
      setDemoSuccess(true);
    } catch (err) {
      setDemoError(err.message || 'Authentication demo failed.');
      setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ⚠ Failed: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSimulateStepByStep = async () => {
    setIsRunning(true);
    setDemoSuccess(false);
    setDemoError('');
    setDemoLog([]);

    for (let i = 0; i < demoSteps.length; i++) {
      setActiveStepIndex(i);
      setDemoLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Executing ${demoSteps[i].title} (${demoSteps[i].actor})`]);
      await new Promise(r => setTimeout(r, 800));
    }

    setDemoSuccess(true);
    setIsRunning(false);
  };

  const handleReset = () => {
    setActiveStepIndex(-1);
    setIsRunning(false);
    setDemoLog([]);
    setDemoSuccess(false);
    setDemoError('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="badge badge-purple">
            <Zap size={14} />
            Live Demonstration Module
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Live Passkey Authentication Demo
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
          Watch every step of the cryptographic challenge-response protocol in real time. 
          Use your actual device authenticator or run the automated walk-through.
        </p>
      </div>

      {/* Control Bar */}
      <div className="cyber-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Username for test (or leave empty for discoverable passkey)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleStartLiveDemo}
              disabled={isRunning || !webAuthnSupported}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <Fingerprint size={18} />
              Start Live Hardware Demo
            </button>

            <button
              onClick={handleSimulateStepByStep}
              disabled={isRunning}
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.5rem', borderColor: 'var(--purple-neon)' }}
            >
              <Play size={18} color="var(--purple-neon)" />
              Simulate Protocol Walkthrough
            </button>

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="btn btn-outline"
              style={{ padding: '0.75rem 1rem' }}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      {demoSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
          <CheckCircle size={20} />
          <div>
            <strong>Authentication Protocol Complete!</strong> All 7 steps verified. Cryptographic signature validated against stored public key.
          </div>
        </div>
      )}

      {demoError && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={20} />
          <div>{demoError}</div>
        </div>
      )}

      {/* 7-Step Sequence View (Section 6) */}
      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
        {/* Left Column: Interactive Step Tracker */}
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--cyan-neon)" />
            Protocol Execution Pipeline
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demoSteps.map((step, idx) => {
              const status = getStepStatus(idx);
              let statusBadge = (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>○ Waiting</span>
              );
              let borderColor = 'var(--border-subtle)';
              let bg = 'rgba(0,0,0,0.2)';

              if (status === 'processing') {
                statusBadge = (
                  <span style={{ fontSize: '0.75rem', color: 'var(--cyan-neon)', fontWeight: 700 }}>
                    ● Processing...
                  </span>
                );
                borderColor = 'var(--cyan-neon)';
                bg = 'rgba(0, 240, 255, 0.1)';
              } else if (status === 'completed') {
                statusBadge = (
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', fontWeight: 700 }}>
                    ✓ Completed
                  </span>
                );
                borderColor = 'rgba(0, 230, 118, 0.4)';
                bg = 'rgba(0, 230, 118, 0.08)';
              }

              return (
                <div
                  key={step.id}
                  style={{
                    padding: '1rem 1.25rem',
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: status === 'processing' ? 'var(--cyan-neon)' : 'var(--text-primary)' }}>
                      {step.title}
                    </div>
                    {statusBadge}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--purple-neon)', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Actor: {step.actor}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Event Terminal Log */}
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="var(--purple-neon)" />
            Real-Time Protocol Telemetry
          </h2>

          <div style={{
            background: '#04070e',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            minHeight: '420px',
            maxHeight: '520px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div style={{ color: 'var(--text-muted)' }}>
              // WebAuthn Cryptographic Protocol Monitor initialized...<br />
              // Ready to capture assertions and challenge exchanges.<br />
              --------------------------------------------------
            </div>

            {demoLog.map((logLine, i) => (
              <div
                key={i}
                style={{
                  color: logLine.includes('✓') 
                    ? 'var(--emerald-neon)' 
                    : logLine.includes('⚠') 
                      ? 'var(--crimson-neon)' 
                      : 'var(--text-secondary)',
                  lineHeight: 1.5
                }}
              >
                {logLine}
              </div>
            ))}

            {isRunning && (
              <div style={{ color: 'var(--cyan-neon)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulse-dot" style={{ background: 'var(--cyan-neon)' }} />
                Awaiting cryptographic response...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
