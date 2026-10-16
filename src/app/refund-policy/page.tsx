import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Refund & Delivery Policy", "One video per verified purchase; keep your code and download promptly.", "/refund-policy");

export default function Page() {
  return <InfoPage label="ORDERS & DELIVERY" title="Refund & Delivery Policy" introduction="One video per verified purchase; keep your code and download promptly." sections={[
    { title: "Price and purchase", content: <p>The initial database prices are $5.99 USD for 480p and $9.99 USD for 720p. Prices may change; the final price is shown before Stripe checkout and preserved in your order. No subscription or credits. Test-mode checkout does not take real money.</p> },
    { title: "Delivery", content: <p>When the server confirms payment and both photos pass safety checks, a video request is submitted. Successful results can be played or downloaded in the same browser for up to three days after storage. Processing times and AI results vary. Cookies are needed for access; a code alone does not restore another device.</p> },
    { title: "Failed or uncertain generation", content: <p>Confirmed failure permits a free retry on the same paid order within input retention and attempt limits. If submission is uncertain, do not retry or pay again: contact support. If paid delivery or retry cannot be provided, contact us to review an appropriate remedy or refund.</p> },
    { title: "Refund requests", content: <p>Email hello@zombievideolab.com with your video code and issue, never card numbers or photos. Technical nondelivery, duplicate charges and applicable rights are reviewed. Approved refunds use the original payment method via Stripe; refunds are not automatic. Statutory rights remain unaffected.</p> },
    { title: "Expiry", content: <p>Downloads expire three days after storage. Physical deletion requires separate storage lifecycle settings; video providers have their own retention policies.</p> },
  ]} />;
}
