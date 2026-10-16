import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Privacy Policy", "Please review how we handle photos, payments and videos before purchasing.", "/privacy");

export default function Page() {
  return <InfoPage label="YOUR DATA" title="Privacy Policy" introduction="Please review how we handle photos, payments and videos before purchasing." sections={[
    { title: "Photo checks", content: <p>On selection an optimized, metadata-stripped copy goes to our server and a vision AI, even if you do not buy. A refusal, non-age safety uncertainty or service error stops checkout. Age uncertainty alone does not reject an otherwise safe portrait; clearly underage portraits are rejected. AI cannot prove age or consent.</p> },
    { title: "Temporary inputs", content: <p>Before checkout two optimized photos are stored privately for fulfillment and eligible paid retries, for at most three days from order creation. We attempt early deletion after delivery; separate object storage lifecycle rules must physically delete remaining objects. Only after verified payment and a second safety check do approved photos go to the configured video provider. Third-party retention is outside our control.</p> },
    { title: "Payment and records", content: <p>Stripe hosts payment and processes card details; we do not store full card numbers. Order records retain the purchased price, payment status, transaction reference and limited webhook identifiers for fulfillment, refunds and accounting. Required billing records can outlast video access.</p> },
    { title: "Finished video", content: <p>Copies are stored privately and accessible for up to three days from successful storage. Physical deletion requires an independent storage lifecycle rule. If copying fails, a temporary provider link may remain on our server for retry. Provider copies have separate retention.</p> },
    { title: "Browser and support", content: <p>A signed HttpOnly visitor cookie lasts up to 90 days and controls access. Browser storage remembers video codes, not offline video files. Clearing cookies or switching devices can remove access; a code alone is insufficient. Hosting providers may process IP and access logs. Support email is used to respond to requests; do not send photos or card data.</p> },
    { title: "Your requests", content: <p>Contact hello@zombievideolab.com for privacy, rights or deletion requests. Third-party copies and legally required billing records may follow different retention periods.</p> },
  ]} />;
}
