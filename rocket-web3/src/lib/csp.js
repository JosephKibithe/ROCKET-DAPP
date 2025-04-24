/**
 * Create a Content Security Policy header
 * @returns {string} CSP header value
 */
export function generateCSP() {
  return `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.coinbase.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.ipfs.dweb.link https://*.coinbase.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.infura.io https://*.walletconnect.org https://*.walletconnect.com https://*.coinbase.com https://api.coinbase.com;
    frame-src 'self' https://*.walletconnect.org https://*.coinbase.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s+/g, " ")
    .trim();
}
