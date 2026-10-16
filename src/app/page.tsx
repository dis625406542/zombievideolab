import { ArrowRight, Clock3, Heart, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import Image from "next/image";
import { DemoVideo } from "@/components/demo-video";
import { Generator } from "@/components/generator";

const questions = [
  { question: "Can I use the zombie couple video generator on my phone?", answer: "Yes. The zombie couple video generator accepts two JPG, PNG or WebP portraits up to 10 MB each on mobile. The 8-second video appears in the browser when generation succeeds. Access to live generation is currently limited to private local testing." },
  { question: "What are the available resolutions and duration?", answer: "Private testing supports an 8-second zombie love video at 480p or 720p, with a selected 9:16 portrait or 16:9 landscape layout, if the chosen model supports those settings. The provider documents longer durations, but they have not been verified here; we do not promise 15–20 seconds." },
  { question: "Which photos work best?", answer: "The zombie couple video generator uses two separate, clear adult portraits with visible faces. Each photo undergoes AI content screening on selection, then both are rechecked before video-provider upload; an uncertain or refused check stops generation. The first photo is referenced as the zombie and the second as the survivor; both become reference images, not first and last frames. AI output may differ from the originals." },
  { question: "Do you upload my photos?", answer: "When you select a photo, a reduced copy is sent to our AI safety service for screening. If you choose to generate a video, the server rechecks both photos; only approved originals go to the video provider. Provider retention varies; do not upload sensitive photos. Finished videos can be accessed from this browser for up to three days after storage." },
  { question: "Is this a free public video generator?", answer: "No. Real zombie couple video generation is limited to private local testing and spends our provider credits. Public checkout, account-free paid orders, billing, and refunds are not live. The sample video is a preview, not a guarantee of how your portraits will be animated." },
  { question: "What if the video task fails?", answer: "An unsuccessful task displays the provider's failure status and does not automatically submit a second paid provider request. No customer payment is accepted at present. A durable paid-order retry and refund process must be built before public launch." },
  { question: "Can I download my finished zombie love video?", answer: "When the finished video is stored successfully, you can play and download it from the same browser for up to three days. Download it before access expires." },
  { question: "Do I need to log in or buy a subscription?", answer: "No login is required for the private test. It does not accept payments. A one-time payment without a subscription is a product plan, not a current checkout option." },
];

function GenerateCta({ label = "Create your zombie video" }: { label?: string }) {
  return <div className="section-generate-cta"><a className="generate-link" href="#generator">{label}<ArrowRight size={18} aria-hidden="true" /></a><span>Back to the tool · Start with two photos</span></div>;
}

export default function HomePage() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="nav-content">
          <a className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></a>
          <nav className="nav-links" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#questions">FAQ</a><a className="nav-action" href="#generator">Try the tool <ArrowRight size={14} /></a></nav>
        </div>
      </header>

      <main>
        <div className="announcement"><span className="announcement-flame">✦</span> A LOVE STORY AFTER THE END OF THE WORLD <span className="announcement-flame">✦</span></div>
        <section className="hero wrapper" aria-labelledby="main-heading">
          <div className="hero-heading"><p className="eyebrow"><span className="eyebrow-line"/> TWO PHOTOS. ONE UNFORGETTABLE STORY.</p><h1 id="main-heading">Zombie Couple <em>Video Generator</em></h1><p className="hero-subtitle">Turn two portraits into the beginning of a cinematic zombie love story. One becomes the zombie. One survives. The rest is your story.</p></div>
          <Generator />
          <p className="hero-note"><ShieldCheck size={16} aria-hidden="true"/> Private generation test: AI checks both photos before any video-provider upload. No public checkout or generation yet.</p>
        </section>

        <section className="trust-row wrapper" aria-label="Product highlights"><div><span className="trust-icon"><Heart size={17} /></span>Made for two photos</div><div><span className="trust-icon"><Sparkles size={17} /></span>A cinematic story</div><div><span className="trust-icon"><ShieldCheck size={17} /></span>No subscription planned</div><div><span className="trust-icon"><Clock3 size={17} /></span>Uploads handled by selected provider</div></section>

        <section id="how-it-works" className="story-section wrapper"><div className="section-topline"><span>01 / THE STORY</span><span>AN UNLIKELY LOVE, REIMAGINED</span></div><div className="story-grid"><div><p className="eyebrow">THE IDEA</p><h2>Even the end of the world has a <em>love story.</em></h2></div><div className="story-description"><p>A zombie couple video starts with a wonderfully strange question: what if your favorite person found you after everything fell apart? In the zombie couple video generator demo, choose a portrait for the zombie and another for the survivor. That simple pairing becomes the foundation of a short, atmospheric scene.</p><p>We designed our zombie couple video generator around that one idea. Instead of overwhelming you with credits, subscriptions, or dozens of template settings, the planned experience keeps the focus on two people and one finished video. Private local tests now submit an 8-second AI video request through the configured provider. Public checkout remains future work; completed private-test copies can be downloaded from this browser for up to three days.</p><GenerateCta label="Try the zombie couple video generator" /></div></div></section>

        <section className="steps-section"><div className="wrapper"><div className="section-intro"><p className="eyebrow">SO SIMPLE IT FEELS LIKE MAGIC</p><h2>Your story in <em>three steps.</em></h2><p>From your camera roll to a story worth sharing—without turning it into a complicated editing project.</p></div><div className="step-grid"><article className="step-card"><div className="step-index">01 <span>↗</span></div><div className="step-icon"><Heart size={27} strokeWidth={1.4}/></div><h3>Pick your two people</h3><p>In the zombie couple video generator, choose a portrait of the person playing the zombie and a portrait of the survivor. Use photos you have permission to share. On selection, AI screens each photo. Both are rechecked before the video provider receives approved originals.</p></article><article className="step-card"><div className="step-index">02 <span>↗</span></div><div className="step-icon"><WandSparkles size={27} strokeWidth={1.4}/></div><h3>Preview the atmosphere</h3><p>Choose 480p or 720p; the private local test checks both portraits with AI first and submits an 8-second video task only if both pass.</p></article><article className="step-card"><div className="step-index">03 <span>↗</span></div><div className="step-icon"><ArrowRight size={27} strokeWidth={1.4}/></div><h3>Get one finished video</h3><p>Successful private tests make the finished video available for playback and download in this browser for up to three days after storage. Real payments and public generation are not enabled yet.</p></article></div><GenerateCta label="Choose your two photos" /></div></section>

        <section className="walkthrough-section wrapper" aria-labelledby="walkthrough-heading">
          <div className="section-intro"><p className="eyebrow">SEE THE TOOL IN ACTION</p><h2 id="walkthrough-heading">Two photos in. <em>Your story begins.</em></h2><p>A look at the upload controls and sample preview before you try the zombie couple video generator.</p></div>
          <figure className="walkthrough-figure">
            <a href="/generator-walkthrough.webp" target="_blank" rel="noopener noreferrer" aria-label="View the full-size generator walkthrough image (opens in a new tab)"><Image src="/generator-walkthrough.webp" alt="Zombie Video Lab walkthrough showing two portrait uploads, video quality controls, and a sample couple video preview" width={1540} height={750} sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1288px) calc(100vw - 72px), 1216px" /></a>
            <figcaption>Interface walkthrough with a sample preview, not a guaranteed result from the pictured portraits. Tap the image to view it full size.</figcaption>
          </figure>
          <GenerateCta label="Try it with your photos" />
        </section>

        <section className="editorial wrapper"><div className="editorial-demo"><div className="visual-window video-window editorial-video"><DemoVideo lazy autoPlay={false} /></div><p className="editorial-demo-caption">Watch the sample · AI results vary with your photos.</p></div><div className="editorial-copy"><p className="eyebrow">A SMALL MOMENT IN A BIG WORLD</p><h2>Made for the <em>unexpected.</em></h2><p>The zombie couple video generator concept is about more than adding a spooky filter. It gives two familiar faces a place in a new world: the last lights in the city, the quiet before sunrise, or a moment of recognition in the middle of the unknown.</p><p>For this zombie couple video generator, the visual direction is romantic rather than graphic: charcoal shadows, warm light, and the feeling that these two characters still know each other. Play the demo to see the atmosphere. It is a sample preview, not a promise of an identical result with your photos.</p><ul className="feature-list"><li><span>01</span> Two clearly assigned character roles</li><li><span>02</span> 8-second video · portrait or landscape options</li><li><span>03</span> One-time purchase, no subscription planned</li></ul><GenerateCta label="Start your own zombie love story" /></div></section>

        <section className="promise-section"><div className="wrapper promise-inner"><div><p className="eyebrow">THE SIMPLE PROMISE</p><h2>One story. <em>One payment.</em><br/> No zombie-sized fine print.</h2></div><p>The paid zombie couple video generator is planned to give you a video you can actually take home: one payment, one successful delivery, and a clear window to download it. If a technical failure occurs, a retry belongs to the original order rather than a new charge. Pricing and the finished-video timeline will be published after provider testing—not guessed from another site&apos;s checkout.</p></div><div className="wrapper"><GenerateCta label="Explore the video tool" /></div></section>

        <section className="guide-section wrapper" aria-labelledby="guide-heading">
          <p className="eyebrow">A CLOSER LOOK AT THE DEMO</p>
          <h2 id="guide-heading">Two portraits, <em>one clear starting point.</em></h2>
          <div className="guide-grid">
            <article><h3>Give each portrait a role</h3><p>The zombie couple video generator asks for two separate photos: the first plays the zombie, the second plays the survivor. Clear, adult faces and good lighting help the AI preserve character roles. Swap either portrait before submitting another task.</p></article>
            <article><h3>Try it on your phone</h3><p>Open the zombie couple video generator on a mobile browser and pick two JPG, PNG, or WebP images from your camera roll. Each file must be under 10 MB. Private testing can produce an 8-second AI video; public generation is disabled until checkout and safeguards launch.</p></article>
            <article><h3>Know what stays private</h3><p>In private testing, photos are sent through our server to a vision AI on submission, then to the video provider only if both pass the safety check. Use only photos of consenting adults; review our privacy policy for provider retention and limitations.</p></article>
            <article><h3>See what comes next</h3><p>The zombie couple video generator is intended to become a one-time-purchase video tool, without credits or a recurring plan. AI animation is integrated for private local tests. Payment, durable cost controls, and paid-order retries remain future work; finished videos are stored privately in testing.</p></article>
          </div>
          <GenerateCta label="Make your zombie couple video" />
        </section>

        <section id="questions" className="faq-section wrapper"><div className="faq-side"><p className="eyebrow">A FEW GOOD QUESTIONS</p><h2>Everything you <em>need to know.</em></h2><p>Considering a zombie couple video? Here are the practical details about the demo, photo permissions, the future paid tool, and what happens when a generation does not work.</p></div><div className="faq-list">{questions.map(({question,answer}) => <details key={question} className="faq-item"><summary>{question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}<GenerateCta label="Ready? Go to the generator" /></div></section>

        <section className="bottom-cta wrapper"><div><p className="eyebrow">READY TO SEE THE IDEA?</p><h2>Every great story <em>starts with two.</em></h2><p>Explore the zombie couple video generator with two portraits. Real AI video generation is available only in private local tests. Public checkout is not enabled.</p></div><a href="#generator" className="bottom-link">Try the demo <ArrowRight size={19}/></a></section>
      </main>

      <footer className="footer"><div className="wrapper footer-inner"><div><a className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></a><p>A little love beyond the end of the world.</p></div><nav className="footer-nav" aria-label="Footer"><a href="#generator">The tool</a><a href="#questions">FAQ</a><a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/acceptable-use">Acceptable Use</a><a href="/refund-policy">Refund &amp; Delivery</a><a href="/contact">Contact</a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Zombie Video Lab. AI stories for entertainment.</span><span>Private video test · no payments enabled</span></div></div></footer>
    </div>
  );
}
