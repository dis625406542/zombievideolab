import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const maxBytes = 80 * 1024 * 1024;
function publicAddress(address: string) {
  if (address.includes(":")) {
    const lower = address.toLowerCase();
    return !/^(::|::1$|f[cd]|fe[89ab]|2001:db8:|::ffff:)/.test(lower);
  }
  const parts = address.split(".").map(Number);
  return parts.length === 4 && parts.every(n => n >= 0 && n <= 255) && !(
    parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 ||
    parts[0] === 169 && parts[1] === 254 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 ||
    parts[0] === 192 && parts[1] === 168 || parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127 ||
    parts[0] === 192 && parts[1] === 0 || parts[0] === 198 && (parts[1] === 18 || parts[1] === 19)
  );
}
async function checkedUrl(value: string): Promise<string> {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.port || url.username || url.password || isIP(url.hostname)) throw new Error("Provider video URL is not allowed.");
  const hosts = (process.env.PROVIDER_VIDEO_HOSTS || "").split(",").map(h => h.trim().toLowerCase()).filter(Boolean);
  // Provider media CDNs vary. Only explicitly trusted hosts can be ingested.
  if (!hosts.some(host => url.hostname.toLowerCase() === host)) throw new Error(`Provider media host ${url.hostname} is not trusted; add this exact hostname to PROVIDER_VIDEO_HOSTS after verifying it.`);
  const records = await lookup(url.hostname, { all: true });
  if (!records.length || records.some(r => !publicAddress(r.address))) throw new Error("Provider media host resolved to a private address.");
  return url.href;
}
export async function fetchProviderVideo(value: string): Promise<Buffer> {
  const url = await checkedUrl(value);
  // Redirects are deliberately forbidden: a redirect could escape the trusted host list.
  const response = await fetch(url, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(90000) });
  if (!response.ok || !response.body) throw new Error(`Provider video download failed (HTTP ${response.status}).`);
  const type = response.headers.get("content-type")?.toLowerCase() || "";
  if (type && !type.includes("video/mp4") && !type.includes("application/octet-stream")) throw new Error("Provider did not return an MP4 video.");
  if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("Provider video exceeds the 80 MB limit.");
  const reader = response.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error("Provider video exceeds the 80 MB limit.");
      parts.push(value);
    }
  } finally { await reader.cancel().catch(() => undefined); }
  const bytes = Buffer.concat(parts.map(p => Buffer.from(p)), size);
  if (size < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") throw new Error("Provider returned an invalid MP4 video.");
  return bytes;
}
