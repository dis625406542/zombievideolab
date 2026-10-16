import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Refund & Delivery Policy", "Checkout is disabled, and no customer payments are accepted. Real AI video tasks are only available in private local testing.", "/refund-policy");

export default function Page() {
  return <InfoPage label="ORDERS & DELIVERY" title="Refund & Delivery Policy" introduction="Checkout is disabled, and no customer payments are accepted. Real AI video tasks are only available in private local testing." sections={[
    { title: "Private testing delivery", content: <p>An eligible private tester can submit two adult portraits to the configured video provider and receive a provider-hosted 8-second video link when generation succeeds. Links may expire, and we do not yet provide a three-day hosted download or a guaranteed delivery time. Save successful results promptly.</p> },
    { title: "Failed generation", content: <p>The task reports failures without silently submitting a second chargeable provider request. No customer order or payment exists in this test. Automatic retry on a paid order is not implemented and should not be assumed available.</p> },
    { title: "Future checkout and refunds", content: <p>Before selling videos publicly, we plan to disclose one-time pricing, currency, applicable taxes, supported inputs, estimated delivery, retention, retry rules, payment processing, and a clear refund policy. No refund can be issued on this site for a payment we do not collect.</p> },
    { title: "Support", content: <p>For a question about a test task, use the contact page; do not email your portrait files or payment information.</p> },
  ]} />;
}
