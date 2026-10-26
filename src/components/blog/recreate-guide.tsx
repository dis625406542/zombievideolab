import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MEME_GUIDE_PATH, TIPTOEING_PATH } from "@/lib/blog";

export const recreateGuideQuestions = [
  { question: "How do I get the same creepy, retro fantasy vibe?", answer: "Use the reference-led Tiptoeing template rather than a generic dance request. Watch the sample for its theatrical setting, dim warm light and playful, slightly uncanny mood. Our prepared storyboard and motion reference guide the style, but every AI result is a new interpretation, not an identical recreation." },
  { question: "Can I choose who dances and who watches?", answer: "Yes. Upload the dancer as photo 1 and the seated observer as photo 2. Both photos must show consenting adults you are authorized to use. Roles follow upload order, not gender, and our workflow requires both photos." },
  { question: "Do I need to upload the original video or write a prompt?", answer: "No. Zombie Video Lab supplies the reference video and prepared instructions. You choose two photos, 480p or 720p and 9:16 or 16:9, then purchase one 15-second generation. There is no custom prompt editor in this template." },
  { question: "What is the affordable way to try it?", answer: "Watch the published examples for free first. Current one-time prices are $5.99 for 480p and $8.99 for 720p; the live generator and checkout show the current price. No login, recurring subscription or credit bundle is required. Personalized video generation is not free." },
  { question: "Will it have the original music and exactly the same dance?", answer: "No. New generations request a silent video without music, vocals or dialogue. The reference preview has audio, but its soundtrack is not included in your generated video. Gestures, face details and choreography can vary. Add permitted music separately if needed. The published real-result example is also silent." },
  { question: "Can I download my clip and post it on TikTok?", answer: "Yes, a successful generation provides an MP4 download. Choose 9:16 for a vertical composition, review the whole clip and download within three days. Only share photos and audio you have permission to use, and follow the destination platform's AI-content and music rules. Reach and virality are not guaranteed." },
];

export function RecreateGuide() {
  return <>
    <div className="article-answer">
      <p><strong>The simplest route:</strong> use a reference-based template that already understands the scene, rather than asking a general AI to invent a random dance. With the <Link href={TIPTOEING_PATH}>Zombie Video Lab Tiptoeing In My Jordans AI video generator</Link>, upload two adult portraits, put the dancer first and the seated observer second, choose your format and pay once for a 15-second clip. The prepared storyboard and motion reference do the setup work. No login or prompt writing is needed.</p>
      <Link className="blog-text-link" href={`${TIPTOEING_PATH}#generator`}>Watch the examples and make your version <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <p className="article-disclosure">Written by the Zombie Video Lab team about our own generator. This is a practical first-party tutorial, not an independent ranking. Competitor pages were reviewed on October 23, 2026; features and prices may change.</p>
    <nav className="article-toc" aria-label="Article contents">
      <h2>In this guide</h2>
      <ul>
        <li><a href="#retro-fantasy">What creates the creepy, retro fantasy vibe?</a></li>
        <li><a href="#cast-your-photos">Choose the dancer and observer</a></li>
        <li><a href="#recreate-the-video">Recreate the video step by step</a></li>
        <li><a href="#compare-workflows">Which tool workflow should you choose?</a></li>
        <li><a href="#music-and-sharing">Music, downloads and TikTok</a></li>
        <li><a href="#common-questions">Frequently asked questions</a></li>
      </ul>
    </nav>
    <section id="retro-fantasy">
      <h2>It is the contrast—not just the tiptoeing—that makes it funny</h2>
      <p>The appeal is an oddly serious fantasy-film atmosphere interrupted by a cheeky performance. Think theatrical staging, shadowy interiors, warm highlights and a dancer who seems far too pleased with the situation. The observer gives the movement a comic counterpoint: one person performs while the other watches it unfold.</p>
      <p>When choosing a generator, look for a scene reference, not just a button labeled “dance.” A generic dance model may produce energetic movement but lose the strange mood, framing and two-person interaction that you actually wanted.</p>
      <ul>
        <li><strong>The visual mood:</strong> muted, film-like color and a dim, storybook setting rather than a bright modern dance studio.</li>
        <li><strong>The performance:</strong> small, exaggerated steps, playful confidence and expressions that make the scene feel knowingly ridiculous.</li>
        <li><strong>The reaction:</strong> a clearly separate observer, not two people accidentally performing the same routine.</li>
        <li><strong>The framing:</strong> enough room to read the movement, alongside closer views that make the expressions matter.</li>
      </ul>
      <p>These are useful details to look for in the published reference and your finished clip. They are not extra settings you need to configure: our template provides the scene direction. “Same vibe” means a similar creative interpretation, not a frame-for-frame copy or a guarantee of every gesture.</p>
    </section>
    <section id="cast-your-photos">
      <h2>Cast two familiar faces before you touch the settings</h2>
      <p><strong>Photo 1 is the dancer. Photo 2 is the seated observer.</strong> That is the most important instruction in our workflow. You can choose either adult for either role; there is no gender selection to work around. Swap the upload order before purchase if you want the other person to dance.</p>
      <p>Pick clear portraits with one visible face in each image. A straightforward photo is easier to review than a group shot, a collage or an image with sunglasses hiding much of the face. You do not need to photograph yourself doing the dance or prepare a costume shot. The template supplies the performance context.</p>
      <p>Use only images of consenting adults you are authorized to process. Photos undergo AI safety screening before generation. Keep the joke playful and nonsexual, with no graphic violence or humiliating use of someone else's likeness. See our <Link href="/acceptable-use">Acceptable Use Policy</Link> if you are unsure what is allowed.</p>
    </section>
    <section id="recreate-the-video">
      <h2>How to recreate the Tiptoeing In My Jordans AI video</h2>
      <ol>
        <li><strong>Watch the reference, then the real example.</strong> Open the <Link href={TIPTOEING_PATH}>Tiptoeing generator</Link>. The reference shows the creative target; the separately labeled real result shows an actual earlier output. The default video is muted, so unmute it if you want to hear reference audio.</li>
        <li><strong>Upload the two people in the right order.</strong> Dancer first, observer second. Check the previews and allow image screening to finish before continuing.</li>
        <li><strong>Choose a 15-second output format.</strong> Select 9:16 for a vertical TikTok-style composition or 16:9 for a wider scene. Choose 480p or 720p; these settings are sent with the generation request.</li>
        <li><strong>Review the price and pay once.</strong> Current prices are $5.99 for 480p and $8.99 for 720p. The live tool and checkout are the source of truth. There is no account registration, subscription or credit pack to manage.</li>
        <li><strong>Let the reference guide the generation.</strong> You do not upload the source clip or paste a long prompt yourself. Our request includes the prepared scene instructions and reference, with AI-created instrumental music requested for new videos. Processing depends on the provider queue; the progress bar is an estimate.</li>
        <li><strong>Review and download the full MP4.</strong> Check both faces, the separation of roles, hands and footwork, not just the thumbnail. Save the video within three days of completion.</li>
      </ol>
      <p>This is a quick-to-start workflow, not a promise of instant rendering. You can understand the setup and watch examples before spending money, but there is no free personalized video or instant AI photo mockup before checkout.</p>
    </section>
    <section id="compare-workflows">
      <h2>Zombie Video Lab, SuperMaker or Media.io: compare the workflow</h2>
      <p>Other sites cover this meme too. The useful question is how much setup you want—not which website makes the biggest promise.</p>
      <ul>
        <li><strong>SuperMaker:</strong> its <a href="https://supermaker.ai/video/tiptoeing-in-my-jordans/" target="_blank" rel="noopener noreferrer">dedicated Tiptoeing page</a> uses two portraits and a built-in reference, with credit-based generation. Compare its current output choices and checkout with the format you need.</li>
        <li><strong>Media.io:</strong> its <a href="https://www.media.io/ai/zh/explore/zone/tiptoeing-in-my-jordans-ai-video-generator" target="_blank" rel="noopener noreferrer">Tiptoeing guide</a> presents solo, two-person and reference-video prompt approaches. Its instructions note that you need a compatible workflow for the chosen inputs.</li>
        <li><strong>Zombie Video Lab:</strong> our focused two-person tool keeps the choices short: two photos, two resolution options, two aspect ratios and a one-time purchase for a 15-second video. The reference and storyboard are already provided; no login is required.</li>
      </ul>
      <p><strong>Our recommendation:</strong> if you want to try this specific meme without choosing a model or organizing prompts, start with <Link href={`${TIPTOEING_PATH}#generator`}>our ready-made generator</Link>. It keeps the process simple and the single-video cost visible. If you want a solo variant or extensive manual scene control, compare other workflows instead; our template is deliberately narrower.</p>
      <p>For an affordable first attempt, watch the examples and consider the lower-priced 480p option. That is a budget choice within our product, not a claim that we are the cheapest site. For a wider overview, read <Link href={MEME_GUIDE_PATH}>what AI tool can make videos like this meme</Link>.</p>
    </section>
    <section id="music-and-sharing">
      <h2>Keep the mood, but understand the music and motion limits</h2>
      <p>New generations request a silent video without music, vocals or dialogue. The reference preview includes audio, but its soundtrack is not included in the generated MP4. Our published real-result sample is also silent. To add music, use a video editor or social app and choose audio you have permission to use; this generator does not supply a licensed recording of the viral song.</p>
      <p>AI can also change small facial details, clothing, expressions or choreography. Before sharing, play the entire result and check that the dancer and observer remain distinct. A fixed template is a convenient starting point, not a professional frame-by-frame editing service.</p>
      <p>For TikTok-style posting, 9:16 is the portrait option. Download the MP4, review any caption or platform disclosure and use only audio you have rights to share. If you add music through a social app, check the license for your intended use. A familiar meme format is not a promise of virality.</p>
      <p>Your private result is temporarily available for <strong>three days</strong>. The same browser can show generation records after refresh using saved references and its signed cookie; this is not permanent storage of the MP4. Keep your video code for support, download promptly and do not rely on switching devices to recover the order. For a confirmed failure, review the <Link href="/refund-policy">retry and delivery policy</Link> before making another payment.</p>
      <p>Want a different creepy-funny story? Our <Link href="/">zombie couple video generator</Link> is a separate, 8-second template with infected-person and rescuer roles. Choose that story instead of the dance if it better fits the joke you want to make.</p>
    </section>
  </>;
}
