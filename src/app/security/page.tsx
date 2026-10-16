import { InfoPage } from "@/components/info-page";
import { infoMetadata } from "@/lib/info";

export const metadata = infoMetadata("Security", "Server-verified payment and private access work alongside imperfect AI safety checks.", "/security");

export default function Page() {
  return <InfoPage label="TRUST & SAFETY" title="Security" introduction="Server-verified payment and private access work alongside imperfect AI safety checks." sections={[
    { title: "Upload and safety", content: <p>The server checks format, signature and size. A vision AI screens optimized portraits on selection and again before generation. Clearly underage portraits are rejected. Age uncertainty alone does not reject an otherwise safe portrait; prohibited content, unresolved non-age safety concerns or a failed safety service stop generation. AI cannot establish age, consent or ownership.</p> },
    { title: "Payment protections", content: <p>Stripe hosts card checkout. Server-side verification and signature-checked webhooks control paid orders; a redirect or video code alone never authorizes generation. Purchased prices are snapshotted. Database quotas and attempt logs reduce duplicate submission; uncertain timeouts require investigation.</p> },
    { title: "Video access", content: <p>Credentials stay server-side. Signed HttpOnly browser cookies control history and private video access for up to three days after storage. Physical deletion additionally needs independently configured lifecycle rules.</p> },
    { title: "Security reports", content: <p>Email hello@zombievideolab.com without attaching photos, secrets or payment details. No system guarantees perfect security or uninterrupted service.</p> },
  ]} />;
}
