export function isTokenExpired(token?: string | null, skewSeconds = 0) {
  const expiresAt = getTokenExpiresAt(token);
  if (!expiresAt) return true;
  return expiresAt <= Date.now() + skewSeconds * 1000;
}

export function getTokenExpiresAt(token?: string | null) {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")));
    if (typeof decoded.exp !== "number") return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

export function markSessionExpired() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("nursetrack-session-expired", "1");
}

export function consumeSessionExpiredFlag() {
  if (typeof window === "undefined") return false;
  const expired = window.sessionStorage.getItem("nursetrack-session-expired") === "1";
  if (expired) window.sessionStorage.removeItem("nursetrack-session-expired");
  return expired;
}
