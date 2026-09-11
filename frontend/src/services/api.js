const API_BASE = '/api';

export function getSessionToken() {
  return localStorage.getItem('passkey_session_token');
}

export function setSessionToken(token) {
  if (token) {
    localStorage.setItem('passkey_session_token', token);
  } else {
    localStorage.removeItem('passkey_session_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getSessionToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // include cookies
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { detail: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.detail || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Registration
  getRegistrationOptions: (payload) => 
    request('/auth/register/options', { method: 'POST', body: JSON.stringify(payload) }),
  verifyRegistration: (payload) => 
    request('/auth/register/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Login
  getLoginOptions: (username) => 
    request('/auth/login/options', { method: 'POST', body: JSON.stringify({ username: username || null }) }),
  verifyLogin: (payload) => 
    request('/auth/login/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Current User
  getMe: () => request('/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getAuthLogs: () => request('/auth/logs'),

  // Multi-passkey management
  getCredentials: () => request('/credentials'),
  getAddPasskeyOptions: (deviceName) => 
    request('/credentials/add/options', { method: 'POST', body: JSON.stringify({ device_name: deviceName }) }),
  verifyAddPasskey: (payload) => 
    request('/credentials/add/verify', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCredential: (credId) => 
    request(`/credentials/${credId}`, { method: 'DELETE' }),

  // System Status
  getSystemStatus: () => request('/auth/status')
};
