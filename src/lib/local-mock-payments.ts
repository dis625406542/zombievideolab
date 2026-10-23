import "server-only";
import type { TemplateId } from "./video-templates";

// No NEXT_PUBLIC flag: the server alone decides whether checkout may be simulated.
export function localMockRuntimeEnabled() {
  return process.env.NODE_ENV === "development" && process.env.LOCAL_MOCK_PAYMENTS === "true"
    && !process.env.VERCEL && !process.env.VERCEL_ENV && !process.env.CI;
}
function loopback(value: string) {
  try {
    const host = new URL(`http://${value}`).hostname;
    return ["localhost", "127.0.0.1", "[::1]"].includes(host);
  } catch { return false; }
}
export function localMockPayments(request: Request, templateId: TemplateId) {
  if (!localMockRuntimeEnabled() || templateId !== "tiptoeing-in-my-jordans") return false;
  const host = request.headers.get("host");
  const forwarded = request.headers.get("x-forwarded-host");
  return !!host && loopback(host) && loopback(new URL(request.url).host)
    && (!forwarded || loopback(forwarded));
}
