

export interface UrlValidationResult {
  isValid: boolean
  error?: string
  normalizedUrl?: string
}

export const validateImportUrl = (url: string): UrlValidationResult => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }

  // Only allow HTTP/HTTPS
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
  }

  // Block common abuse patterns
  const blockedPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /0\.0\.0\.0/,
    /10\./,
    /172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /192\.168\./,
    /file:\/\//i,
    /data:/i,
    /javascript:/i,
    /vbscript:/i
  ]

  for (const pattern of blockedPatterns) {
    if (pattern.test(url)) {
      return { isValid: false, error: 'URL contains blocked patterns' }
    }
  }

  // Normalize URL
  const normalizedUrl = parsed.toString()

  return { isValid: true, normalizedUrl }
}

