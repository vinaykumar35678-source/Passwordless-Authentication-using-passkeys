import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Key, Fingerprint, Lock, User, LogOut, CheckCircle, GraduationCap, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, webAuthnSupported, platformAuthAvailable } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/register', label: 'Register' },
    { path: '/login', label: 'Login' },
    { path: '/security', label: 'Security' },
    { path: '/cryptography', label: 'Cryptography' },
    { path: '/demo', label: 'Demo' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/architecture', label: 'Architecture' },
    { path: '/threat-model', label: 'Threat Model' },
  ];

  return (
    <header style={{
      background: 'rgba(6, 9, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(157, 78, 221, 0.2))',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
          }}>
            <Shield size={20} color="var(--cyan-neon)" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              PASSKEY <span style={{ color: 'var(--cyan-neon)', fontSize: '0.85rem', fontWeight: 600 }}>// WebAuthn</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Zero-Password Cryptographic Auth
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {navLinks.map((item) => {
            if (item.requireAuth && !user) return null;
            if (item.hideWhenAuth && user) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--cyan-neon)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Seminar Mode CTA */}
          <Link
            to="/seminar"
            className="badge badge-purple"
            style={{
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            <GraduationCap size={15} />
            🎓 Seminar Mode
          </Link>
        </nav>

        {/* Right Section: Hardware Badge & Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Compatibility Pill */}
          <div
            className={`badge ${webAuthnSupported ? 'badge-emerald' : 'badge-crimson'}`}
            title={webAuthnSupported ? 'WebAuthn hardware authenticator supported' : 'WebAuthn unsupported on this browser'}
            style={{ fontSize: '0.75rem' }}
          >
            <div className="pulse-dot" style={{ background: webAuthnSupported ? 'var(--emerald-neon)' : 'var(--crimson-neon)' }} />
            {webAuthnSupported ? (platformAuthAvailable ? 'FIDO2 / Platform Ready' : 'WebAuthn Ready') : 'Unsupported'}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <Fingerprint size={15} color="var(--emerald-neon)" />
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                title="Sign out of passkey session"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                Create Passkey
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
