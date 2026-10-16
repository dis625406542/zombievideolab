// The apex permanently redirects to www. Normalize an older Vercel env value as well.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.zombievideolab.com").replace(/^https?:\/\/zombievideolab\.com$/i, "https://www.zombievideolab.com");
export const SITE_NAME = "Zombie Video Lab";
export const TITLE = "Zombie Couple Video Generator | Zombie Video Lab";
export const DESCRIPTION = "Create an 8-second zombie couple video from two consenting adult portraits. Choose 480p or 720p with one-time Stripe checkout when available; no account or subscription.";
