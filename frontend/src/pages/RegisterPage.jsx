import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Key, Shield, Fingerprint, CheckCircle, AlertCircle, Loader2, 
  Lock, ArrowRight, Server, Smartphone, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { registerWithPasskey, webAuthnSupported } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [deviceName, setDeviceName] = useState('My Primary Device');
  
  const [currentStep, setCurrentStep] = useState(0); 
  // 0 = idle, 1 = challenge request, 2 = awaiting biometric/PIN, 3 = server verification, 4 = complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setCurrentStep(1); // Generating challenge

    try {
      // Small pause to visualize challenge generation
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(2); // Awaiting device prompt

      const result = await registerWithPasskey({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        deviceName: deviceName.trim() || 'Primary Passkey'
      });

      setCurrentStep(3); // Verifying
      await new Promise(r => setTimeout(r, 400));
      setCurrentStep(4); // Success!

      setSuccessData(result);
    } catch (err) {
      setCurrentStep(0);
      setError(err.message || 'Passkey registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'User clicks: Create Passkey', desc: 'Initiates registration with username & email' },
    { num: 2, title: 'Server generates a random challenge', desc: 'Cryptographically secure 32-byte single-use nonce' },
    { num: 3, title: 'Browser invokes WebAuthn', desc: 'Calls navigator.credentials.create() with options' },
    { num: 4, title: 'Device asks for: Fingerprint / Face / PIN', desc: 'User verifies identity locally on device' },
    { num: 5, title: 'Authenticator creates a credential/key pair', desc: 'Secure hardware generates asymmetric keypair' },
    { num: 6, title: 'Public key is registered with server', desc: 'Public key stored in database (0 passwords)' },
    { num: 7, title: 'Private key remains protected by the authenticator', desc: 'Stored inside device secure hardware 🔒' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="badge badge-cyan">
            <Key size={14} />
            W3C WebAuthn Credential Creation
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Create Your Passkey Account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Experience genuine passwordless security. Your identity is verified directly by your device's 
          cryptographic chip without ever creating a password.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
        {/* Left Column: Registration Form or Success Card */}
        <div className="cyber-card" style={{ padding: '2.25rem' }}>
          {successData ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(0, 230, 118, 0.15)',
                border: '2px solid var(--emerald-neon)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 25px rgba(0, 230, 118, 0.35)'
              }}>
                <CheckCircle size={38} color="var(--emerald-neon)" />
              </div>

              <h2 style={{ color: 'var(--emerald-neon)', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
                ✓ Passkey Created Successfully
              </h2>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Your device has generated an asymmetric public/private keypair. 
                The public key is now registered with the server.
              </p>

              {/* Hardware vs Server Visualizer */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                marginBottom: '1.75rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>SERVER STORAGE:</span>
                  <span style={{ color: 'var(--emerald-neon)', fontWeight: 600, fontSize: '0.85rem' }}>Public Key ✓</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DEVICE STORAGE:</span>
                  <span style={{ color: 'var(--cyan-neon)', fontWeight: 600, fontSize: '0.85rem' }}>Private Key 🔒 (Secure Enclave)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PASSWORD:</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>None (0 stored)</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-emerald"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                Go to Protected Dashboard
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Shield size={20} color="var(--cyan-neon)" />
                <h3 style={{ fontSize: '1.2rem' }}>Account Details</h3>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div>{error}</div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alice Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. alice_crypto"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  disabled={loading}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Alphanumeric characters, dots, dashes, or underscores.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. alice@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Device Passkey Label (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Laptop Windows Hello / MacBook Touch ID"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Security Notice Box */}
              <div style={{
                background: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-neon)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <Info size={16} />
                  Privacy & Biometric Guarantee
                </div>
                “Your device will ask you to verify your identity (fingerprint, face, PIN, or hardware key). 
                Your biometric data stays on your device and is not sent to this application.”
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
                disabled={loading || !webAuthnSupported}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {currentStep === 1 && 'Generating Challenge...'}
                    {currentStep === 2 && 'Verify on your device (Biometric/PIN)...'}
                    {currentStep === 3 && 'Verifying Public Key...'}
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    Create Passkey
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: 'var(--cyan-neon)', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in with Passkey
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: WebAuthn Registration Visualization (Section 5) */}
        <div className="cyber-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Fingerprint size={22} color="var(--emerald-neon)" />
            <h3 style={{ fontSize: '1.15rem' }}>Registration Lifecycle Animation</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Visualizes every event that occurs between your browser, hardware authenticator, and backend server.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stepsList.map((st) => {
              const isPassed = currentStep >= 4 || (currentStep > 0 && currentStep * 2 >= st.num);
              const isCurrent = loading && (
                (currentStep === 1 && st.num <= 2) ||
                (currentStep === 2 && st.num >= 3 && st.num <= 5) ||
                (currentStep === 3 && st.num >= 6)
              );

              return (
                <div
                  key={st.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent 
                      ? 'rgba(0, 240, 255, 0.12)' 
                      : isPassed 
                        ? 'rgba(0, 230, 118, 0.08)' 
                        : 'rgba(0, 0, 0, 0.25)',
                    border: isCurrent 
                      ? '1px solid var(--cyan-neon)' 
                      : isPassed 
                        ? '1px solid rgba(0, 230, 118, 0.3)' 
                        : '1px solid var(--border-subtle)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: isCurrent 
                      ? 'var(--cyan-neon)' 
                      : isPassed 
                        ? 'var(--emerald-neon)' 
                        : 'rgba(255, 255, 255, 0.1)',
                    color: isCurrent || isPassed ? '#000' : 'var(--text-muted)',
                    flexShrink: 0
                  }}>
                    {isPassed ? '✓' : st.num}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: isCurrent ? 'var(--cyan-neon)' : isPassed ? 'var(--emerald-neon)' : 'var(--text-primary)'
                    }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Security Split Graphic */}
          <div style={{
            marginTop: '1.75rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(8, 20, 35, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <Server size={22} color="var(--cyan-neon)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>SERVER STORAGE</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', fontWeight: 600, marginTop: '0.25rem' }}>
                Public Key ✓ (COSE Bytes)
              </div>
            </div>

            <div style={{
              background: 'rgba(25, 12, 35, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <Smartphone size={22} color="var(--purple-neon)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>DEVICE STORAGE</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyan-neon)', fontWeight: 600, marginTop: '0.25rem' }}>
                Private Key 🔒 (Secure Enclave)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
