/** Whitelist https/http and relative /api/blob; reject javascript:, data:, vbscript:, protocol-relative. */
export function isValidImageUrl(url: string): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("//")
  ) {
    return false;
  }
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true;
  if (lower.startsWith("/api/blob")) return true;
  return false;
}
