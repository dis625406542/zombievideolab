import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("About", "Two consenting adult portraits become one fictional 8-second zombie love video.", "/about");

export default function Page() {
  return <InfoPage label="THE PROJECT" title="About" introduction="Two consenting adult portraits become one fictional 8-second zombie love video." sections={[
    { title: "The product", content: <p>Choose 480p or 720p, portrait or landscape. When checkout is available, pay once through Stripe; server-verified payment starts generation. No subscription, account, credits or email delivery.</p> },
    { title: "Your results", content: <p>Finished videos can be downloaded in the same browser for up to three days after storage. The video code identifies an order but does not restore cross-device access.</p> },
    { title: "Responsible use", content: <p>Upload only authorized portraits of consenting adults. AI results vary. We are not affiliated with any film or game franchise.</p> },
  ]} />;
}
