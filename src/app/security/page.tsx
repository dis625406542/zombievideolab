import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Security", "Private local video generation now uses server-side provider credentials; public generation is disabled pending durable metering and payment protection.", "/security");

export default function Page() {
  return <InfoPage label="TRUST & SAFETY" title="Security" introduction="Private local video generation now uses server-side provider credentials; public generation is disabled pending durable metering and payment protection." sections={[
    { title: "Private test safeguards", content: <p>Provider API keys remains server-side. Requests require same-origin browser submission, basic file-size and image-signature checks, a local development environment, and a conservative per-process attempt limit. A task status link uses a signed, expiring handle. These controls are not a substitute for durable public rate limits.</p> },
    { title: "Still to be implemented", content: <p>Authenticated paid orders, verified checkout webhooks, durable distributed rate limits, private R2 storage, provider deletion guarantees, moderation and reliable paid-order retry/refund handling are not yet implemented. Do not treat the current local test as a public production service.</p> },
    { title: "Reporting issues", content: <p>If you discover a security or privacy problem, email hello@zombievideolab.com with the affected URL and safe steps to reproduce it. Never submit third-party private photos as evidence or disrupt the service.</p> },
    { title: "Content safety", content: <p>Only upload portraits of consenting adults. This fictional entertainment tool must not be used for deceptive impersonation, exploitation, harassment, or graphic content.</p> },
  ]} />;
}
