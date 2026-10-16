// The apex permanently redirects to www. Normalize an older Vercel env value as well.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.zombievideolab.com").replace(/^https?:\/\/zombievideolab\.com$/i, "https://www.zombievideolab.com");
export const SITE_NAME = "Zombie Video Lab";
export const TITLE = "Zombie Couple Video Generator | Zombie Video Lab";
export const DESCRIPTION = "Explore our two-photo zombie couple video generator. Private local tests generate 8-second 480p or 720p AI videos with the configured provider; public generation and checkout are not yet available.";
