import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Fingerprint, Shield, CheckCircle, AlertCircle, Loader2, 
  ArrowRight, Key, Lock, Laptop, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithPasskey, webAuthnSupported } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [authStage, setAuthStage] = useState(''); // 'options', 'device', 'verifying', 'done'

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    setLoading(true);
    setAuthStage('options');

    try {
      // Step 1: Challenge request
      await new Promise(r => setTimeout(r, 300));
      setAuthStage('device');

      // Step 2: Device assertion
      await loginWithPasskey(username.trim() || undefined);

      setAuthStage('verifying');
      await new Promise(r => setTimeout(r, 400));
      setAuthStage('done');
      setSuccess(true);

      // Transition to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 900);
    } catch (err) {
      setAuthStage('');
      setError(err.message || 'Passkey authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <div className="cyber-card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 230, 118, 0.15))',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-glow-cyan)'
          }}>
            <Fingerprint size={32} color="var(--cyan-neon)" />
          </div>

          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
            Passwordless Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Sign in securely using your device passkey (Fingerprint, Face, or PIN).
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <div>✓ Authentication successful! Redirecting to dashboard...</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. alice_crypto"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Leave blank to use discoverable passkey (autofill), or enter username.
            </span>
          </div>

          {/* Device verification active banner */}
          {loading && authStage === 'device' && (
            <div style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid var(--cyan-neon)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--cyan-neon)'
            }}>
              <Loader2 size={20} className="animate-spin" />
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Please scan your fingerprint, look at your camera, or enter device PIN on your system prompt.
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
            disabled={loading || !webAuthnSupported}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {authStage === 'options' && 'Requesting Server Challenge...'}
                {authStage === 'device' && 'Awaiting Device Authenticator...'}
                {authStage === 'verifying' && 'Verifying Digital Signature...'}
                {authStage === 'done' && 'Authenticated!'}
              </>
            ) : (
              <>
                <Key size={18} />
                Sign in with Passkey
              </>
            )}
          </button>

          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)'
          }}>
            Don't have a passkey yet?{' '}
            <Link to="/register" style={{ color: 'var(--cyan-neon)', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </form>
      </div>

      {/* Security note card */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'rgba(16, 25, 46, 0.5)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        🛡️ WebAuthn assertion signatures are verified via cryptographic public keys. 
        Zero passwords are sent across the network.
      </div>
    </div>
  );
}
