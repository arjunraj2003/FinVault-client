import { WebAuthnError } from "@simplewebauthn/browser";

const PASSKEY_ID_KEY = "finvault_passkey_id";

export function getStoredPasskeyId() {
  return localStorage.getItem(PASSKEY_ID_KEY);
}

export function setStoredPasskeyId(credentialId: string) {
  localStorage.setItem(PASSKEY_ID_KEY, credentialId);
}

export function clearStoredPasskeyId() {
  localStorage.removeItem(PASSKEY_ID_KEY);
}

export function hasStoredPasskey() {
  return Boolean(getStoredPasskeyId());
}

export async function platformAuthenticatorAvailable() {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  if (!window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isPasskeyCancelled(error: unknown) {
  if (error instanceof WebAuthnError) {
    return error.code === "ERROR_CEREMONY_ABORTED" || error.name === "NotAllowedError";
  }
  return error instanceof DOMException && error.name === "NotAllowedError";
}
