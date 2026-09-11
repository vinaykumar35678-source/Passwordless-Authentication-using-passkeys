import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setSessionToken, getSessionToken } from '../services/api';
import { executeRegistration, executeAuthentication, checkWebAuthnSupport, checkPlatformAuthenticator } from '../services/webauthn';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);
  const [platformAuthAvailable, setPlatformAuthAvailable] = useState(false);
  const [systemStats, setSystemStats] = useState(null);

  // Check hardware & browser compatibility on mount
  useEffect(() => {
    const isSupported = checkWebAuthnSupport();
    setWebAuthnSupported(isSupported);
    if (isSupported) {
      checkPlatformAuthenticator().then(setPlatformAuthAvailable);
    }
  }, []);

  // Fetch current user if session exists
  useEffect(() => {
    const initAuth = async () => {
      const token = getSessionToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          // Token expired or invalid
          setSessionToken(null);
          setUser(null);
        }
      }
      try {
        const stats = await api.getSystemStatus();
        setSystemStats(stats);
      } catch (err) {
        console.warn('System status check skipped:', err.message);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      setSessionToken(null);
      throw err;
    }
  };

  const registerWithPasskey = async ({ fullName, username, email, deviceName }) => {
    if (!checkWebAuthnSupport()) {
      throw new Error('Your browser or device does not support passkey authentication. Please use a modern browser.');
    }

    // Step 1: Request registration options & challenge from server
    const optionsJSON = await api.getRegistrationOptions({
      full_name: fullName,
      username,
      email
    });

    // Step 2: Invoke device authenticator (Biometrics / PIN / Security Key)
    const credentialResponse = await executeRegistration(optionsJSON);

    // Step 3: Send public key & cryptographic attestation to backend for verification
    const verificationResult = await api.verifyRegistration({
      username,
      full_name: fullName,
      email,
      credential: credentialResponse,
      device_name: deviceName || 'Primary Device Passkey'
    });

    // Step 4: Establish session
    setSessionToken(verificationResult.token);
    setUser(verificationResult.user);
    return verificationResult;
  };

  const loginWithPasskey = async (username) => {
    if (!checkWebAuthnSupport()) {
      throw new Error('Your browser or device does not support passkey authentication. Please use a modern browser.');
    }

    // Step 1: Request authentication options & challenge from server
    const optionsJSON = await api.getLoginOptions(username);

    // Step 2: Invoke device authenticator to produce assertion signature
    const assertionResponse = await executeAuthentication(optionsJSON);

    // Step 3: Send assertion to backend for cryptographic signature verification
    const verificationResult = await api.verifyLogin({
      username: username || null,
      credential: assertionResponse
    });

    // Step 4: Establish session
    setSessionToken(verificationResult.token);
    setUser(verificationResult.user);
    return verificationResult;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error ignored:', err.message);
    } finally {
      setSessionToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        webAuthnSupported,
        platformAuthAvailable,
        systemStats,
        registerWithPasskey,
        loginWithPasskey,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
