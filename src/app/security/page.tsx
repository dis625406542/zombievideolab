import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Security", "Read about current safeguards, upload safety limits, private video access and responsible security reporting for Zombie Video Lab.", "/security");

export default function Page() {
  return <InfoPage label="TRUST & SAFETY" title="Security" introduction="Our private test has basic protections, but they are not a substitute for production payment, abuse prevention, or content moderation controls." sections={[
    { title: "What the private test does today", content: <p>Provider credentials stay on the server. The generation endpoint is limited to local private testing, checks same-origin requests, validates image type, signature and file size, and requires a consent confirmation. It uses a conservative in-process attempt limit, not a durable distributed rate limit. Job history and video access are tied to a signed, HttpOnly browser cookie; a Video Code by itself cannot retrieve a video on another device. Completed videos are copied to a private R2 bucket when storage succeeds.</p> },
    { title: "Limits of content checks", content: <p>File validation does not verify age, identity, consent, or whether a photo contains explicit or graphic content. We have not implemented automatic content moderation or universal manual pre-review. Follow the <a href="/acceptable-use">Acceptable Use Policy</a>; the AI provider may independently reject requests.</p> },
    { title: "Remaining production work", content: <p>Public payments are disabled. Verified checkout and order webhooks, durable cost controls and rate limiting, and reliable paid-order failure and refund handling still need to be built before a public paid launch. R2 lifecycle deletion for generated objects must be configured separately; the application limits download access to three days but cannot by itself guarantee physical deletion at that time. We cannot guarantee when a provider removes its copies.</p> },
    { title: "Report a security issue", content: <p>If you find a security, privacy, or abuse issue, email <a href="mailto:hello@zombievideolab.com">hello@zombievideolab.com</a> with the affected URL, time, and safe reproduction steps. Do not attach another person&apos;s photos, probe other users&apos; data, or disrupt the service. We cannot promise a fixed response deadline during private testing.</p> },
  ]} />;
}
