const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";

/**
 * Resolves any image URL (database /api/media/:id, external https://, or static /path).
 * If the path starts with /api/media/ and NEXT_PUBLIC_API_URL is configured,
 * prepends the backend origin.
 */
export function resolveImageUrl(src: string | null | undefined): string {
  if (!src || !src.trim()) {
    return FALLBACK_IMAGE_URL;
  }

  const trimmed = src.trim();

  // External URLs and data URIs
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Database-stored media route
  if (trimmed.startsWith("/api/media/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const backendOrigin = apiUrl.replace(/\/api\/?$/, "");
    return backendOrigin ? `${backendOrigin}${trimmed}` : trimmed;
  }

  // Local static root-relative paths
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return trimmed;
}
