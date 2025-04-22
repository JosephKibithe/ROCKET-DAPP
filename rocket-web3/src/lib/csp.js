/**
 * Create a Content Security Policy header
 * @returns {string} CSP header value
 */
export function generateCSP() {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.ipfs.dweb.link;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.infura.io https://*.walletconnect.org;
    frame-src 'self' https://*.walletconnect.org;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s+/g, " ")
    .trim();
}
