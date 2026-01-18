/**
 * Generate a unique token for room identification
 * @returns {string} Random alphanumeric token
 */
export function generateToken() {
    return Math.random().toString(36).substring(2);
}

/**
 * Ensure URL has a valid protocol prefix
 * @param {string} url - The URL to validate
 * @returns {string} URL with http/https prefix
 */
export function normalizeUrl(url) {
    if (!url.match(/^https?:\/\//i)) {
        return 'http://' + url;
    }
    return url;
}

/**
 * Get token from URL query parameters
 * @returns {string|null} Token from URL or null
 */
export function getTokenFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
}

/**
 * Build connection URL with token
 * @param {string} token - Room token
 * @returns {string} Full URL with token parameter
 */
export function buildConnectionUrl(token) {
    // Use the full URL without query params to include path like /SnapShare/
    const baseUrl = window.location.href.split('?')[0];
    return `${baseUrl}?token=${token}`;
}
