import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Contact & Support", "Questions about payments, videos or privacy? Contact us.", "/contact");

export default function Page() {
  return <InfoPage label="WE CAN HELP" title="Contact & Support" introduction="Questions about payments, videos or privacy? Contact us." sections={[
    { title: "Email", content: <p>Write to hello@zombievideolab.com and include your video code, issue and browser details. Never send portraits, passwords, API keys or card numbers.</p> },
    { title: "Order assistance", content: <p>Definite generation failure permits a free retry while inputs and attempts remain available. If a request is uncertain or you cannot retry, contact us before buying again. See the Refund and Delivery Policy.</p> },
    { title: "Privacy and safety", content: <p>For rights or security questions, use Privacy request or Security report in your email subject.</p> },
  ]} />;
}
