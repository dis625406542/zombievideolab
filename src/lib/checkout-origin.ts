/** Checkout redirects must use the browser origin, not Next's internal proxy URL. */
export function checkoutReturnOrigin(request: Request, options: {
  production: boolean;
  siteUrl: string;
  allowedDevOrigins: string;
}): string {
  if (options.production) return new URL(options.siteUrl).origin;
  const value = request.headers.get("origin");
  if (!value) throw new Error("Invalid checkout origin.");
  const origin = new URL(value);
  const host = request.headers.get("host");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  const allowed = options.allowedDevOrigins.split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
  if (origin.username || origin.password || origin.origin !== value || origin.host !== host ||
      (local ? origin.protocol !== "http:" : origin.protocol !== "https:" || !allowed.includes(origin.host))) {
    throw new Error("Invalid checkout origin.");
  }
  return origin.origin;
}
