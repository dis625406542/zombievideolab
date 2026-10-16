import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Refund & Delivery Policy", "No payments are accepted in private testing. Learn how generated videos are delivered, when downloads expire, and what remains to be implemented before paid launch.", "/refund-policy");

export default function Page() {
  return <InfoPage label="ORDERS & DELIVERY" title="Refund & Delivery Policy" introduction="No customer payments are accepted today. The displayed price and checkout are a simulation for private testing, not a billable order." sections={[
    { title: "Current test delivery", content: <p>Private testers may submit two consenting adult portraits for an approximately 8-second video. If generation succeeds, we attempt to copy the result to a private Cloudflare R2 bucket. When that copy succeeds, the video is available for playback and download to the same browser for up to three days after storage. Save it promptly. Copying can fail or be retried on a later status check; delivery time and successful generation are not guaranteed. Clearing the signed browser cookie or changing devices can make results inaccessible, even if you kept the Video Code.</p> },
    { title: "Storage and expiry", content: <p>After three days, application downloads are no longer offered. Physical deletion of stored video objects requires a separately configured three-day R2 lifecycle rule; provider-side storage has its own retention practices. See the <a href="/privacy">Privacy Policy</a>.</p> },
    { title: "Failures and refunds today", content: <p>Failed or uncertain tasks are reported without automatically issuing another provider request. The demo never charges a customer, so there is no customer payment to refund or paid video to redeliver. Keep your Video Code and contact support before resubmitting an uncertain task; a second provider request may consume credits.</p> },
    { title: "Before any paid launch", content: <p>We must publish the actual one-time price and currency, accepted payment method, expected delivery, failed-generation remedy, refund eligibility and request process, and any legally required consumer rights before accepting real orders. Payment processing and paid-order refund automation have not been implemented. No subscription or customer credit plan is offered.</p> },
    { title: "Support", content: <p>For a test-task question, use our <a href="/contact">contact page</a> and include your Video Code if available. Do not email portrait files or payment information.</p> },
  ]} />;
}
