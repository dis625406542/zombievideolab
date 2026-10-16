import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Terms of Service", "Private local testers may submit two adult portraits for fictional AI video generation through the configured provider. Public paid generation and checkout are not enabled.", "/terms");

export default function Page() {
  return <InfoPage label="USING THE SITE" title="Terms of Service" introduction="Private local testers may submit two adult portraits for fictional AI video generation through the configured provider. Public paid generation and checkout are not enabled." sections={[
    { title: "Permitted use", content: <p>Only use photos you own or are authorized to use, and only where every pictured person is an adult who has consented to AI video processing. No deceptive impersonation, harassment, explicit exploitation, violence, or unlawful content. Provider moderation and availability may prevent generation.</p> },
    { title: "Current service limits", content: <p>Private testing requests an 8-second 480p or 720p video. AI results are variable, may fail, and may not match the supplied faces. Submitted photos are forwarded to the configured provider (PoYo or YIR); completed videos are copied to private R2 storage when the copy succeeds. Downloads are available for up to three days after storage; R2 lifecycle deletion must be configured separately. Provider processing and result availability are outside our control. There is no public paid service yet.</p> },
    { title: "No purchase yet", content: <p>There is no paid checkout, subscription, customer credits, or charged customer order at present. A one-time purchase, refunds and repeat generation on a paid order are proposals, not features. See the refund and delivery policy for what is not currently available.</p> },
    { title: "Ownership and support", content: <p>Your underlying image rights stay yours; you warrant permission to submit them for processing. The site text, original illustrations, and brand have their own rights. We are independent of zombie franchises. For concerns please use our contact page.</p> },
  ]} />;
}
