/** Paths that require login — guests must not be sent here via "Continue as Guest" */

const AUTH_REQUIRED_PREFIXES = ['/cart', '/checkout', '/admin'];

/**
 * Safe destination after "Continue as Guest" on sign-in.
 * If user was redirected from a protected page (e.g. cart), send them home instead of looping back to sign-in.
 */
export function getGuestContinuePath(fromLocation) {
  const pathname = fromLocation?.pathname || '';
  const needsAuth = AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!pathname || needsAuth) {
    return '/';
  }

  const search = fromLocation?.search || '';
  const hash = fromLocation?.hash || '';
  return `${pathname}${search}${hash}`;
}

export function isAuthRequiredPath(pathname = '') {
  return AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
