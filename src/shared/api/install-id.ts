export const INSTALL_ID_COOKIE_NAME = "install_id";
export const INSTALL_ID_STORAGE_KEY = "storefront_install_id";
export const INSTALL_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 10;

function readInstallIdCookie() {
  if (typeof document === "undefined" || !document.cookie) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${INSTALL_ID_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  const [, value = ""] = cookie.split("=");

  return decodeURIComponent(value) || null;
}

function writeInstallIdCookie(installId: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${INSTALL_ID_COOKIE_NAME}=${encodeURIComponent(installId)}; ` +
    `Path=/; Max-Age=${INSTALL_ID_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function readInstallIdStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(INSTALL_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeInstallIdStorage(installId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(INSTALL_ID_STORAGE_KEY, installId);
  } catch {
    // Ignore storage write failures and keep cookie fallback.
  }
}

export function createInstallId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `install-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getClientInstallId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const storageInstallId = readInstallIdStorage();

  if (storageInstallId) {
    writeInstallIdCookie(storageInstallId);
    return storageInstallId;
  }

  const cookieInstallId = readInstallIdCookie();

  if (cookieInstallId) {
    writeInstallIdStorage(cookieInstallId);
    return cookieInstallId;
  }

  const nextInstallId = createInstallId();

  writeInstallIdStorage(nextInstallId);
  writeInstallIdCookie(nextInstallId);

  return nextInstallId;
}
