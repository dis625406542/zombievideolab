import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("About", "Zombie Video Lab explores fictional zombie love videos built from two adult portraits.", "/about");

export default function Page() {
  return <InfoPage label="THE PROJECT" title="About" introduction="Zombie Video Lab explores fictional zombie love videos built from two adult portraits." sections={[
    { title: "What is available", content: <p>A private local integration sends two permitted portraits to the configured provider (PoYo or YIR) for an 8-second 480p or 720p video. Public generation and paid checkout are not enabled. The illustration on the home page is original concept art, not a model output.</p> },
    { title: "What is planned", content: <p>We want a simple single-video purchase rather than a subscription, with durable order tracking, retries, private downloads and disclosed file lifetimes. These features are not yet live.</p> },
    { title: "Who should use it", content: <p>Use only your photos or images of consenting adults you have permission to process. This is fictional entertainment and must not be used for deceptive impersonation. We are not affiliated with any film or game franchise.</p> },
  ]} />;
}
