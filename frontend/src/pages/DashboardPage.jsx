import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Key, Fingerprint, Lock, CheckCircle, LogOut, RefreshCw, 
  Smartphone, Laptop, Trash2, Plus, AlertCircle, Clock, Award, Eye, 
  ChevronRight, Play, Pause, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { executeRegistration } from '../services/webauthn';

export default function DashboardPage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  // Multi-passkey addition state
  const [addingPasskey, setAddingPasskey] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [addPasskeyError, setAddPasskeyError] = useState('');
  const [addPasskeySuccess, setAddPasskeySuccess] = useState('');

  // Seminar animation step in dashboard (Steps 1 to 6)
  const [demoStep, setDemoStep] = useState(1);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  // Demo auto-play loop
  useEffect(() => {
    let timer;
    if (isDemoPlaying) {
      timer = setInterval(() => {
        setDemoStep((prev) => (prev >= 6 ? 1 : prev + 1));
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isDemoPlaying]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await api.getAuthLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleAddPasskey = async (e) => {
    e.preventDefault();
    setAddPasskeyError('');
    setAddPasskeySuccess('');
    setAddingPasskey(true);

    try {
      const deviceLabel = newDeviceName.trim() || 'Secondary Device Passkey';
      const optionsJSON = await api.getAddPasskeyOptions(deviceLabel);
      const credential = await executeRegistration(optionsJSON);
      await api.verifyAddPasskey({ credential, device_name: deviceLabel });
      setAddPasskeySuccess(`✓ Passkey '${deviceLabel}' registered successfully!`);
      setNewDeviceName('');
      await refreshUser();
      await fetchLogs();
    } catch (err) {
      setAddPasskeyError(err.message || 'Failed to add passkey.');
    } finally {
      setAddingPasskey(false);
    }
  };

  const handleDeletePasskey = async (credId, deviceName) => {
    if (!window.confirm(`Are you sure you want to remove the passkey for '${deviceName}'?`)) return;

    try {
      await api.deleteCredential(credId);
      await refreshUser();
      await fetchLogs();
    } catch (err) {
      alert(err.message || 'Failed to remove passkey');
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--cyan-neon)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Verifying secure session...</p>
      </div>
    );
  }

  const primaryCred = user.credentials?.[0];

  const seminarSteps = [
    { num: 1, title: 'Step 1: User Requests Login', actor: 'Client Browser', desc: 'Sends username/email to backend server asking for an authentication challenge.' },
    { num: 2, title: 'Step 2: Server Generates Challenge', actor: 'FastAPI Backend', desc: 'Produces a cryptographically secure 32-byte single-use random nonce with 5-minute TTL.' },
    { num: 3, title: 'Step 3: Authenticator Verifies User', actor: 'Hardware Authenticator', desc: 'Prompts for fingerprint, face, or device PIN. Biometric data never leaves the hardware.' },
    { num: 4, title: 'Step 4: Private Key Signs Challenge', actor: 'Secure Enclave / TPM', desc: 'Asymmetric private key computes an ECDSA P-256 digital signature over the challenge and client data.' },
    { num: 5, title: 'Step 5: Server Verifies with Public Key', actor: 'Backend Cryptographic Engine', desc: 'Uses the stored COSE public key to mathematically verify the signature and checks sign count.' },
    { num: 6, title: 'Step 6: User is Authenticated', actor: 'Session Manager', desc: 'Server grants access and creates an authenticated session token. ZERO passwords transferred or stored.' },
  ];

  return (
    <div>
      {/* 1. WELCOME HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-emerald">
              <CheckCircle size={14} />
              Authenticated via WebAuthn
            </span>
            <span className="badge badge-cyan">
              NIST AAL3 / FIDO2
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>
            Welcome, <span style={{ color: 'var(--cyan-neon)' }}>{user.full_name}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Account: <strong style={{ color: 'var(--text-primary)' }}>@{user.username}</strong> ({user.email})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowSecurityModal(true)}
            className="btn btn-outline"
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
          >
            <Eye size={16} />
            View Security Details
          </button>
          <button
            onClick={logout}
            className="btn btn-danger"
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* 2. SECURITY STATUS CARDS GRID (Section 6 & 9) */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Card 1: Official Security Dashboard Card */}
        <div className="cyber-card" style={{ padding: '1.75rem', border: '1px solid var(--border-glow)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <h3 style={{ fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--cyan-neon)' }}>
              SECURITY DASHBOARD
            </h3>
            <span className="badge badge-emerald">✓ SECURE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication</span>
              <strong style={{ color: 'var(--cyan-neon)' }}>PASSKEY / WEBAUTHN</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <strong style={{ color: 'var(--emerald-neon)' }}>✓ VERIFIED</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Credential</span>
              <strong style={{ color: 'var(--text-primary)' }}>REGISTERED</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Public Key</span>
              <strong style={{ color: 'var(--emerald-neon)' }}>STORED (SERVER)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Private Key</span>
              <strong style={{ color: 'var(--purple-neon)' }}>DEVICE ONLY 🔒</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Password</span>
              <strong style={{ color: 'var(--text-secondary)' }}>NOT REQUIRED (0 STORED)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Authentication</span>
              <strong style={{ color: 'var(--cyan-neon)' }}>
                {user.last_login ? new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '19:30'}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Security Score (Section 9) */}
        <div className="cyber-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Award size={20} color="var(--emerald-neon)" />
            <h3 style={{ fontSize: '1.1rem' }}>Security Score</h3>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--emerald-neon)',
              lineHeight: 1
            }}>
              {user.security_score}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ color: 'var(--emerald-neon)', fontWeight: 600, marginTop: '0.5rem', fontSize: '1rem' }}>
              Strong Authentication
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            ℹ️ Educational project metric based on FIDO2 passwordless standards and multi-passkey redundancy.
          </div>
        </div>

        {/* Card 3: Last Login & Account Metadata */}
        <div className="cyber-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={20} color="var(--cyan-neon)" />
            <h3 style={{ fontSize: '1.1rem' }}>Session & Cryptography</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Last Authentication</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Just now'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Active Authenticators</div>
              <div style={{ fontWeight: 600, color: 'var(--cyan-neon)' }}>
                {user.credentials?.length || 0} Hardware Passkey(s)
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Cryptographic Algorithm</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                ES256 (ECDSA P-256 / SHA-256)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-PASSKEY SUPPORT SECTION (Section 11) */}
      <div className="cyber-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={22} color="var(--cyan-neon)" />
              My Registered Passkeys
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Multi-passkey redundancy allows you to register secondary laptops, phones, or hardware security keys.
            </p>
          </div>
        </div>

        {addPasskeySuccess && (
          <div className="alert alert-success">{addPasskeySuccess}</div>
        )}
        {addPasskeyError && (
          <div className="alert alert-error">{addPasskeyError}</div>
        )}

        {/* Passkeys List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
          {user.credentials?.map((cred, idx) => (
            <div
              key={cred.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'rgba(8, 14, 28, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cred.device_name.toLowerCase().includes('phone') || cred.device_name.toLowerCase().includes('mobile') ? (
                    <Smartphone size={22} color="var(--cyan-neon)" />
                  ) : (
                    <Laptop size={22} color="var(--cyan-neon)" />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {cred.device_name}
                    {idx === 0 && <span className="badge badge-cyan" style={{ marginLeft: '0.6rem', fontSize: '0.7rem' }}>Primary</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Credential ID: {cred.credential_id.substring(0, 24)}...
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Registered: {new Date(cred.created_at).toLocaleDateString()} | Signature Counter: {cred.sign_count}
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleDeletePasskey(cred.id, cred.device_name)}
                  className="btn btn-outline"
                  style={{
                    color: 'var(--crimson-neon)',
                    borderColor: 'rgba(255, 51, 102, 0.3)',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.82rem'
                  }}
                  title="Remove passkey"
                  disabled={user.credentials.length <= 1}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Passkey Form */}
        <form onSubmit={handleAddPasskey} style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.25)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder="Label for new passkey (e.g. Work Laptop, YubiKey, iPhone Touch ID)"
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            disabled={addingPasskey}
            style={{ flex: '1 1 250px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
            disabled={addingPasskey}
          >
            <Plus size={16} />
            {addingPasskey ? 'Prompting Device...' : 'Add Another Passkey'}
          </button>
        </form>
      </div>

      {/* 4. SEMINAR DEMONSTRATION MODE: "How Passkeys Work" (Section 19) */}
      <div className="cyber-card" style={{ padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(157, 78, 221, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>
              🎓 College Seminar Demonstration Mode
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>
              How Passkeys Work: 6-Step Cryptographic Flow
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Interactive visualizer designed to explain the authentication handshake during your presentation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsDemoPlaying(!isDemoPlaying)}
              className={`btn ${isDemoPlaying ? 'btn-danger' : 'btn-emerald'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {isDemoPlaying ? <><Pause size={15} /> Pause Animation</> : <><Play size={15} /> Auto Play</>}
            </button>
            <button
              onClick={() => { setDemoStep(1); setIsDemoPlaying(false); }}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {seminarSteps.map((st) => (
            <button
              key={st.num}
              onClick={() => { setDemoStep(st.num); setIsDemoPlaying(false); }}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: 'var(--radius-sm)',
                background: demoStep === st.num ? 'rgba(157, 78, 221, 0.25)' : 'rgba(0,0,0,0.3)',
                border: demoStep === st.num ? '1px solid var(--purple-neon)' : '1px solid var(--border-subtle)',
                color: demoStep === st.num ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>STEP {st.num}</div>
            </button>
          ))}
        </div>

        {/* Active Step Showcase */}
        {(() => {
          const current = seminarSteps[demoStep - 1];
          return (
            <div style={{
              background: 'rgba(8, 14, 28, 0.9)',
              border: '1px solid var(--purple-neon)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.75rem',
              boxShadow: '0 0 25px rgba(157, 78, 221, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c77dff', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-purple">{current.actor}</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {current.title}
              </h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {current.desc}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setDemoStep((p) => Math.max(1, p - 1))}
                  disabled={demoStep === 1}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Previous Step
                </button>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  {demoStep} of 6
                </div>
                <button
                  onClick={() => setDemoStep((p) => Math.min(6, p + 1))}
                  disabled={demoStep === 6}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Next Step
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 5. AUTHENTICATION EVENT LOG (Section 10) */}
      <div className="cyber-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--cyan-neon)" />
              Authentication Event Log
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Non-sensitive audit log of cryptographic authentication events.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            disabled={logsLoading}
          >
            <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No authentication events recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {log.status === 'SUCCESS' ? (
                    <span style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>✓</span>
                  ) : (
                    <span style={{ color: 'var(--crimson-neon)', fontWeight: 700 }}>⚠</span>
                  )}
                  <div>
                    <strong style={{ color: log.status === 'SUCCESS' ? 'var(--text-primary)' : 'var(--crimson-neon)' }}>
                      {log.event_type.replace('_', ' ')}
                    </strong>
                    {log.details && (
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.6rem', fontSize: '0.82rem' }}>
                        — {log.details}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. SECURITY DETAILS MODAL */}
      {showSecurityModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 2000
        }}>
          <div className="cyber-card" style={{ maxWidth: '640px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--cyan-neon)', marginBottom: '1rem' }}>
              Cryptographic Credential Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PRIMARY CREDENTIAL ID (BASE64URL)</div>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all' }}>
                  {primaryCred?.credential_id}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>COSE PUBLIC KEY ALGORITHM</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-neon)' }}>
                  COSEAlgorithmIdentifier.ECDSA_SHA_256 (-7) / NIST P-256
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ORIGIN BINDING</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>
                  http://localhost:5173 (Strict Domain Origin Check)
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RELYING PARTY ID (RP ID)</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>localhost</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PASSWORDS STORED IN DB</div>
                <div style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>
                  0 (ZERO - Schema enforces no password column)
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
