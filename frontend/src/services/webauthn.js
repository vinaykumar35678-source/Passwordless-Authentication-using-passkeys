import {
  startRegistration as simpleStartRegistration,
  startAuthentication as simpleStartAuthentication,
  browserSupportsWebAuthn as simpleBrowserSupportsWebAuthn,
  platformAuthenticatorIsAvailable as simplePlatformAuthenticatorIsAvailable
} from '@simplewebauthn/browser';

/**
 * Checks if the browser supports WebAuthn APIs
 */
export function checkWebAuthnSupport() {
  return simpleBrowserSupportsWebAuthn();
}

/**
 * Checks if platform authenticator (TouchID, FaceID, Windows Hello, PIN) is available
 */
export async function checkPlatformAuthenticator() {
  try {
    return await simplePlatformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

/**
 * Executes WebAuthn registration via browser
 */
export async function executeRegistration(optionsJSON) {
  try {
    const credentialResponse = await simpleStartRegistration({ optionsJSON });
    return credentialResponse;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Passkey creation was cancelled or timed out on your device.');
    } else if (error.name === 'InvalidStateError') {
      throw new Error('This authenticator has already registered a passkey for this account.');
    } else if (error.name === 'AbortError') {
      throw new Error('The passkey operation was aborted.');
    } else {
      throw new Error(error.message || 'Failed to create passkey on device.');
    }
  }
}

/**
 * Executes WebAuthn authentication via browser
 */
export async function executeAuthentication(optionsJSON) {
  try {
    const assertionResponse = await simpleStartAuthentication({ optionsJSON });
    return assertionResponse;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Authentication cancelled or biometric/PIN check failed.');
    } else if (error.name === 'AbortError') {
      throw new Error('The authentication request was aborted.');
    } else {
      throw new Error(error.message || 'Failed to authenticate with device passkey.');
    }
  }
}
