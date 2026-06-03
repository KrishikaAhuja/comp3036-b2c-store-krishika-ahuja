export function getSafeNextPath(next?: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export function getCustomerLoginUrl(nextPath?: string | null) {
  return `/auth?next=${encodeURIComponent(getSafeNextPath(nextPath))}`;
}
