import { ArrowRight, Check, Mic2, ShieldCheck } from "lucide-react";
import { TinyStudio } from "@/components/tiny-studio";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { TinyGuides } from "@/components/tiny-guides";

const scenes = [
  { number: "01", title: "The room", detail: "Warm shelves and close-set lights frame the imagined session.", className: "tiny-scene-room" },
  { number: "02", title: "The microphone", detail: "The performer takes the central spot behind the mic.", className: "tiny-scene-mic" },
  { number: "03", title: "The live-set feeling", detail: "A drummer and a small-room backdrop add the concert mood.", className: "tiny-scene-band" },
  { number: "04", title: "Your close-up", detail: "A portrait-style frame brings the focus back to you.", className: "tiny-scene-closeup" },
];

const faqs = [
  { question: "What is the Tiny Desk AI video trend?", answer: "It is a photo-to-video concept inspired by the intimate desk-side concert look: a singer at a microphone, bookshelves, warm lights and a small-room performance mood. Different creators and tools interpret it differently. Tiny Desk AI Videos is independent and not affiliated with NPR or Tiny Desk Concerts." },
  { question: "Is this an official Tiny Desk Concert or NPR product?", answer: "No. This is an independent, unofficial creative concept. It is not a real Tiny Desk Concert and is not affiliated with, endorsed by, or sponsored by NPR or Tiny Desk Concerts." },
  { question: "How do I make a Tiny Desk AI video from a photo?", answer: "The planned flow is to choose a clear single-person photo, select Standard or HD quality and, once the service is launched, create a concert-inspired clip. Today the studio is a visual preview: photo selection only previews locally and Generate is unavailable." },
  { question: "Can I generate a video here right now?", answer: "Not yet. The current studio is a design preview; it does not upload a photo, generate a video or take a payment. Concept illustrations are not generated video examples." },
  { question: "What should I put in a Tiny Desk AI prompt?", answer: "For a general concert-inspired scene, describe a small room with warm practical lighting, shelves, a microphone, a performer and a close-up camera; specify your preferred framing. Our current preview has no prompt box or active generator, so this is a creative tip rather than a feature promise." },
  { question: "What kind of photo works best?", answer: "Choose a clear, well-lit photo of one adult, with the face visible and some room around the head and shoulders. Avoid group shots, heavy occlusion and images you do not have permission to use. The browser preview currently accepts JPG, PNG or WebP up to 10 MB." },
  { question: "Can I use a celebrity or someone else’s photo?", answer: "Only use a photo of yourself or an adult who has agreed to appear. Do not use someone's likeness without consent or impersonate a public figure. Final content and safety policies will be published before generation launches." },
  { question: "Does the video have music or accurate lip sync?", answer: "No music, original performance audio, singing or accurate lip sync is promised. Generation has not launched, and the illustration is silent concept art. Any future audio features would be described only after they have been built and tested." },
  { question: "How long will my video be, and how long does it take?", answer: "We have not established a verified duration or turnaround time for the future product. We will publish those details after the generation workflow is working and tested." },
  { question: "Will my face look exactly like my photo?", answer: "No AI video can be assumed to preserve every facial detail perfectly. We cannot show verified examples or make quality claims until the generator exists. For now the preview does not transform your photo." },
  { question: "Is there a free Tiny Desk AI filter or app?", answer: "There are various third-party tools and trends online, but this website is not a TikTok/Instagram filter and does not offer a downloadable app. Here, image selection is only a local preview; no free or paid generation is available yet." },
  { question: "How much does a Tiny Desk AI video cost?", answer: "Planned one-time prices are $5.99 per Standard (480p) video and $8.99 per HD (720p) video. They are preview prices, not a purchase offer. Nothing can be purchased here until checkout and the actual product launch." },
  { question: "Do I need an account or credits?", answer: "The planned purchase experience is one payment per video, without a credit bundle or account requirement. There is currently no checkout, so no login or credits are needed to explore the preview." },
  { question: "Can I download or share my video?", answer: "No real video can be downloaded from this preview. A download/share workflow will be described when there are working, tested generated outputs. The illustrations on this page are placeholders, not samples of the final result." },
  { question: "How long are photos kept?", answer: "In the current preview, selected photos stay in your browser session and are never sent to the server. Future upload retention and privacy terms are not finalized; they will be published before generation and payments become available." },
];

export default function HomePage() {
  return (
    <div className="tiny-site">
      <SiteHeader />
      <main>
        <section id="studio" className="tiny-hero" aria-labelledby="tiny-title">
          <div className="tiny-hero-copy">
            <p className="tiny-pill"><span className="tiny-bars" aria-hidden="true">▂▅▇</span> YOUR MOMENT BEHIND THE MIC</p>
            <h1 id="tiny-title" aria-label="Tiny Desk AI Video Generator">Tiny Desk <span><em>AI</em> Videos</span><small>AI Video Generator</small></h1>
            <span className="tiny-underline" aria-hidden="true" />
            <p className="tiny-hero-description">Your photo. Your spotlight. A cozy little concert with a microphone, bookshelves and warm studio lights — the Tiny Desk-inspired moment you&apos;ve been waiting for.</p>
            <ul className="tiny-highlights"><li>✦ Your photo, center stage</li><li>✦ Cozy concert vibe</li><li>✦ One-time pricing</li><li>✦ No credits needed</li></ul>
          </div>
          <TinyStudio />
        </section>

        <section className="tiny-section tiny-moment" aria-labelledby="moment-title">
          <div className="tiny-story-intro"><h2 id="moment-title">What happens in your <em>Tiny Desk AI video?</em></h2><p>Picture a small concert room: warm lights, shelves, a microphone and you in the spotlight. These four frames show the visual direction we are exploring — <strong>not finished video frames.</strong></p></div>
          <div className="tiny-scene-grid">{scenes.map(scene => <article className="tiny-scene" key={scene.number}><div className={`tiny-scene-image ${scene.className}`}><img src="/tiny-concert-concept.svg" alt={`Illustrated concert concept: ${scene.title.toLowerCase()}`} /><span>CONCEPT · {scene.number}</span></div><div className="tiny-scene-copy"><span>BEAT {scene.number}</span><h3>{scene.title}</h3><p>{scene.detail}</p></div></article>)}</div>
          <p className="tiny-art-note">Original concept illustration reused with different framing. Not generated footage or a guarantee of the final video.</p>
        </section>

        <section className="tiny-section tiny-trend" aria-labelledby="trend-title"><div className="tiny-trend-panel"><div><span className="tiny-gold-label">THE DESK-SIDE CONCERT LOOK</span><h2 id="trend-title">Where the <em>Tiny Desk AI</em> idea comes from</h2></div><div className="tiny-trend-copy"><p>It is easy to recognize the small-room performance aesthetic: a performer close to the microphone, a wall of books and records, warm lamps and musicians within arm’s reach. The appeal is the intimacy of a live session rather than the scale of an arena.</p><p>Online creators are exploring photo-to-video interpretations of this look. Our site is developing an <strong>independent, unofficial</strong> concert-inspired concept. These illustrated frames describe a mood; they are not real AI output or an NPR production.</p><a href="/blog/tiny-desk-ai-trend-explained">Explore the visual trend <ArrowRight size={16}/></a><a href="/blog/tiny-desk-ai-photo-tips">How to prepare your photo <ArrowRight size={16}/></a></div></div></section>

        <section id="how-it-works" className="tiny-section tiny-how" aria-labelledby="how-title"><div className="tiny-how-heading"><h2 id="how-title">How to make a <em>Tiny Desk AI video</em></h2><p>Three steps for the planned experience. For now, this is a visual preview — no generation, upload or payment.</p></div><div className="tiny-how-layout"><div className="tiny-how-steps"><article><span className="tiny-how-number">1</span><div><h3>Add your photo</h3><p>Choose one well-lit portrait of an adult who agreed to appear. The current studio only shows it on your device; it does not upload it.</p></div></article><article><span className="tiny-how-number">2</span><div><h3>Pick your quality</h3><p>Preview Standard 480p at $5.99 or HD 720p at $8.99, each planned as a one-time price. Purchasing is not enabled yet.</p></div></article><article><span className="tiny-how-number">3</span><div><h3>Create, then download — when available</h3><p>The Generate button will remain disabled until the video workflow is built and tested. Video duration, sound and download options are not confirmed yet.</p></div></article></div><aside className="tiny-photo-checklist"><h3>Photos that work best</h3><ul><li>One adult per photo, with their consent.</li><li>Face visible, with head and shoulders in frame.</li><li>Even light; avoid sunglasses or heavy shadows.</li><li>JPG, PNG or WebP, up to 10 MB in this preview.</li><li>No celebrities, minors or unauthorized likenesses.</li></ul><a href="/blog/tiny-desk-ai-photo-tips">See the photo guide <ArrowRight size={16}/></a></aside></div></section>

        <section id="pricing" className="tiny-section tiny-pricing" aria-labelledby="pricing-title"><div className="tiny-section-intro"><span className="tiny-kicker">SIMPLE PRICING</span><h2 id="pricing-title">Pay per video. <em>That&apos;s it.</em></h2><p>No credits to count. No subscription to cancel. Planned one-time prices for each video.</p></div><div className="tiny-price-grid"><article className="tiny-price-card"><span className="tiny-price-name">Standard</span><strong>$5.99</strong><p>One concert-inspired AI video in 480p.</p><a href="#studio">Explore the studio <ArrowRight size={17} /></a><ul><li><Check size={17} /> One-time payment</li><li><Check size={17} /> Standard 480p quality</li><li><Check size={17} /> No subscription or credits</li></ul></article><article className="tiny-price-card featured"><span className="tiny-popular">HIGHER QUALITY</span><span className="tiny-price-name">HD</span><strong>$8.99</strong><p>One concert-inspired AI video in 720p.</p><a href="#studio">Explore the studio <ArrowRight size={17} /></a><ul><li><Check size={17} /> One-time payment</li><li><Check size={17} /> Crisp 720p quality</li><li><Check size={17} /> No subscription or credits</li></ul></article></div><p className="tiny-price-note"><ShieldCheck size={15} /> Checkout is not enabled yet. No payment can be taken from this page.</p></section>

        <section className="tiny-section tiny-sound-section" aria-labelledby="sound-title"><div className="tiny-sound-intro"><h2 id="sound-title">The mood behind the <em>microphone.</em></h2><p>Books, bandmates and a close-up camera make this concert-inspired look instantly recognizable. What is part of the concept, and what is still to be built?</p></div><div className="tiny-sound-grid"><div className="tiny-sound-facts"><div><span>LOOK</span><strong>Warm, desk-side concert atmosphere</strong></div><div><span>INPUT</span><strong>One consented adult portrait</strong></div><div><span>FORMAT</span><strong>Planned 480p / 720p options</strong></div><div><span>STATUS</span><strong>Visual preview · not generating yet</strong></div></div><div className="tiny-sound-names"><h3>Good to know</h3><ul><li><strong>Tiny Desk AI trend</strong> · a visual idea, not an official series</li><li><strong>Concept frames</strong> · original illustration, not video output</li><li><strong>Music &amp; lip sync</strong> · not available or promised</li><li><strong>One-time pricing</strong> · planned, checkout not open</li></ul><div className="tiny-sound-links"><a href="/blog/tiny-desk-ai-trend-explained">What the trend is <ArrowRight size={16}/></a><a href="/blog/tiny-desk-ai-video-guide">How to prepare <ArrowRight size={16}/></a></div></div></div></section>

        <TinyGuides compact />

        <section id="faq" className="tiny-section tiny-faq" aria-labelledby="faq-title"><div className="tiny-faq-layout"><div className="tiny-faq-intro"><span className="tiny-kicker">GOOD TO KNOW</span><h2 id="faq-title">Tiny Desk AI <em>FAQ.</em></h2><p>Honest answers about the trend, the preview, photo safety and our planned pricing.</p></div><div className="tiny-faq-list">{faqs.map(({ question, answer }) => <details key={question}><summary>{question}<span aria-hidden="true">⌄</span></summary><p>{answer}</p></details>)}</div></div></section>

        <section className="tiny-final"><span className="tiny-kicker">YOUR TURN IN THE SPOTLIGHT</span><h2>A little desk. <em>A big moment.</em></h2><p>Explore the new Tiny Desk AI Videos studio. Video generation is coming soon.</p><a href="#studio">Explore the studio <ArrowRight size={18} /></a></section>
      </main>
      <SiteFooter />
    </div>
  );
}
