import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Contact & Support", "Questions about private video tests, photo rights, privacy, or future orders? Get in touch.", "/contact");

export default function Page() {
  return <InfoPage label="WE CAN HELP" title="Contact & Support" introduction="Questions about private video tests, photo rights, privacy, or future orders? Get in touch." sections={[
    { title: "Email", content: <p>Email hello@zombievideolab.com with the affected page, browser, and (if available) a non-sensitive description of the issue. Please do not email photos, API keys, passwords, or card details. There is no paid order support process yet because checkout is disabled.</p> },
    { title: "Privacy and security", content: <p>For privacy or security questions, put Privacy request or Security report in the subject and see our privacy and security pages.</p> },
    { title: "Tool status", content: <p>Private local testing can generate a video through the configured provider. The public site does not yet provide generation, payment or a guaranteed hosted download.</p> },
  ]} />;
}
