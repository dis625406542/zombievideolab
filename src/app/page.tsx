import { ArrowRight, Clock3, Heart, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import Image from "next/image";
import { DemoVideo } from "@/components/demo-video";
import { Generator } from "@/components/generator";

const questions = [
  { question: "Can I use the zombie couple video generator on my phone?", answer: "Yes. Choose two JPG, PNG or WebP portraits up to 10 MB each. We optimize the images for upload and check them for prohibited content. When checkout is configured, verified paid orders can generate an 8-second video on mobile or desktop." },
  { question: "What are the resolutions, duration and prices?", answer: "Choose an 8-second zombie love video at 480p or 720p, in 9:16 or 16:9. One-time prices are $5.99 USD for 480p and $8.99 USD for 720p. Prices are displayed from the current product catalog before checkout; the amount shown at purchase is saved on your order. Availability depends on the configured video provider." },
  { question: "Which photos work best?", answer: "Use two separate, clear portraits of consenting adults with visible faces. The first plays the zombie and the second the survivor. AI checks each image when selected and rechecks both before generation. AI results may differ from the source photos." },
  { question: "What happens to my photos?", answer: "A reduced copy goes to a safety AI when you select each photo. If you proceed to checkout, optimized portraits are temporarily stored privately for payment and any eligible retry. We send approved photos to the video provider only after verified payment and another safety check. See our Privacy Policy for retention details." },
  { question: "Is this a free video generator?", answer: "The sample is free to preview. Video generation is a one-time purchase, not a subscription or a credit package. If checkout is unavailable, you cannot be charged or start a new paid order." },
  { question: "What if my paid video fails?", answer: "Keep your video code. A confirmed generation failure lets you retry the same paid purchase without a new payment, within the allowed attempt and photo-retention limits. If submission status is uncertain, do not pay or retry; contact support so we can investigate. See our Refund & Delivery Policy." },
  { question: "Can I download my finished zombie love video?", answer: "After successful storage you can play or download your video in the same browser for up to three days. Download it promptly; clearing your cookies or switching devices can prevent access sooner." },
  { question: "Do I need an account or subscription?", answer: "No login, recurring subscription or credits. Your signed browser cookie protects your purchase and video history; the 32-character video code is a reference, not a login or cross-device download pass." },
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
          <p className="hero-note"><ShieldCheck size={16} aria-hidden="true"/> AI screens selected photos. Paid generation starts only after server-verified checkout and a second safety check.</p>
        </section>

        <section className="trust-row wrapper" aria-label="Product highlights"><div><span className="trust-icon"><Heart size={17} /></span>Made for two photos</div><div><span className="trust-icon"><Sparkles size={17} /></span>A cinematic story</div><div><span className="trust-icon"><ShieldCheck size={17} /></span>One-time purchase</div><div><span className="trust-icon"><Clock3 size={17} /></span>Private three-day downloads</div></section>

        <section id="how-it-works" className="story-section wrapper"><div className="section-topline"><span>01 / THE STORY</span><span>AN UNLIKELY LOVE, REIMAGINED</span></div><div className="story-grid"><div><p className="eyebrow">THE IDEA</p><h2>Even the end of the world has a <em>love story.</em></h2></div><div className="story-description"><p>A zombie couple video starts with a wonderfully strange question: what if your favorite person found you after everything fell apart? In the zombie couple video generator, choose a portrait for the zombie and another for the survivor. That simple pairing becomes the foundation of a short, atmospheric scene.</p><p>We designed our zombie couple video generator around that one idea. Instead of overwhelming you with credits, subscriptions, or dozens of template settings, the experience keeps the focus on two people and one finished video. After Stripe confirms a one-time payment, approved photos can be used for an 8-second AI video. Completed copies can be downloaded in the same browser for up to three days after storage.</p><GenerateCta label="Try the zombie couple video generator" /></div></div></section>

        <section className="steps-section"><div className="wrapper"><div className="section-intro"><p className="eyebrow">SO SIMPLE IT FEELS LIKE MAGIC</p><h2>Your story in <em>three steps.</em></h2><p>From your camera roll to a story worth sharing—without turning it into a complicated editing project.</p></div><div className="step-grid"><article className="step-card"><div className="step-index">01 <span>↗</span></div><div className="step-icon"><Heart size={27} strokeWidth={1.4}/></div><h3>Pick your two people</h3><p>In the zombie couple video generator, choose a portrait of the person playing the zombie and a portrait of the survivor. Use photos you have permission to share. On selection, AI screens each photo. Both are rechecked before the video provider receives approved optimized photos.</p></article><article className="step-card"><div className="step-index">02 <span>↗</span></div><div className="step-icon"><WandSparkles size={27} strokeWidth={1.4}/></div><h3>Preview the atmosphere</h3><p>Choose 480p or 720p; the tool checks both portraits with AI, displays your one-time price, then submits an 8-second video task only after verified payment and a second safety check.</p></article><article className="step-card"><div className="step-index">03 <span>↗</span></div><div className="step-icon"><ArrowRight size={27} strokeWidth={1.4}/></div><h3>Get one finished video</h3><p>Successful paid orders make the finished video available for playback and download in this browser for up to three days after storage. Keep your video code and download promptly.</p></article></div><GenerateCta label="Choose your two photos" /></div></section>

        <section className="walkthrough-section wrapper" aria-labelledby="walkthrough-heading">
          <div className="section-intro"><p className="eyebrow">SEE THE TOOL IN ACTION</p><h2 id="walkthrough-heading">Two photos in. <em>Your story begins.</em></h2><p>A look at the upload controls and sample preview before you try the zombie couple video generator.</p></div>
          <div className="walkthrough-gallery">
            <figure className="walkthrough-figure">
              <a href="/generator-walkthrough-back.webp" target="_blank" rel="noopener noreferrer" aria-label="View the full-size nighttime story example (opens in a new tab)"><Image src="/generator-walkthrough-back.webp" alt="Zombie couple video example with two uploaded portraits and a rescuer shining a flashlight on the infected woman" width={1500} height={765} sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1288px) calc(100vw - 72px), 1216px" /></a>
              <figcaption><span className="walkthrough-step">01 / THE DISCOVERY</span><span>Two portraits. A familiar face in the dark.</span></figcaption>
            </figure>
            <figure className="walkthrough-figure">
              <a href="/generator-walkthrough-back1.webp" target="_blank" rel="noopener noreferrer" aria-label="View the full-size reunion story example (opens in a new tab)"><Image src="/generator-walkthrough-back1.webp" alt="The same two characters reunited in a warm sunset scene from the zombie couple video example" width={1535} height={756} sizes="(max-width: 700px) calc(100vw - 36px), (max-width: 1288px) calc(100vw - 72px), 1216px" /></a>
              <figcaption><span className="walkthrough-step">02 / THE REUNION</span><span>The same two characters. A moment worth keeping.</span></figcaption>
            </figure>
          </div>
          <p className="walkthrough-note">Actual example screenshots, not a guarantee of an identical result with your photos. Tap either image to view it full size.</p>
          <GenerateCta label="Try it with your photos" />
        </section>

        <section className="editorial wrapper"><div className="editorial-demo"><div className="visual-window video-window editorial-video demo-window"><DemoVideo lazy autoPlay={false} /></div><p className="editorial-demo-caption">Watch the sample · AI results vary with your photos.</p></div><div className="editorial-copy"><p className="eyebrow">A SMALL MOMENT IN A BIG WORLD</p><h2>Made for the <em>unexpected.</em></h2><p>The zombie couple video generator concept is about more than adding a spooky filter. It gives two familiar faces a place in a new world: the last lights in the city, the quiet before sunrise, or a moment of recognition in the middle of the unknown.</p><p>For this zombie couple video generator, the visual direction is romantic rather than graphic: charcoal shadows, warm light, and the feeling that these two characters still know each other. Play the demo to see the atmosphere. It is a sample preview, not a promise of an identical result with your photos.</p><ul className="feature-list"><li><span>01</span> Two clearly assigned character roles</li><li><span>02</span> 8-second video · portrait or landscape options</li><li><span>03</span> One-time purchase, no subscription</li></ul><GenerateCta label="Start your own zombie love story" /></div></section>

        <section className="promise-section"><div className="wrapper promise-inner"><div><p className="eyebrow">THE SIMPLE PROMISE</p><h2>One story. <em>One payment.</em><br/> No zombie-sized fine print.</h2></div><p>The zombie couple video generator offers one-time pricing from the current product catalog and a three-day download window after successful storage. A confirmed technical failure can be retried on the original paid order within the documented limits; an uncertain submission needs support review. AI results and delivery times can vary.</p></div><div className="wrapper"><GenerateCta label="Explore the video tool" /></div></section>

        <section className="guide-section wrapper" aria-labelledby="guide-heading">
          <p className="eyebrow">A CLOSER LOOK AT THE TOOL</p>
          <h2 id="guide-heading">Two portraits, <em>one clear starting point.</em></h2>
          <div className="guide-grid">
            <article><h3>Give each portrait a role</h3><p>The zombie couple video generator asks for two separate photos: the first plays the zombie, the second plays the survivor. Clear, adult faces and good lighting help the AI preserve character roles. Swap either portrait before submitting another task.</p></article>
            <article><h3>Try it on your phone</h3><p>Open the zombie couple video generator on a mobile browser and pick two JPG, PNG, or WebP images from your camera roll. Each file must be under 10 MB. A verified one-time purchase can produce an 8-second AI video when secure checkout is available.</p></article>
            <article><h3>Know what stays private</h3><p>Photos are sent through our server to a vision AI when selected and again on submission, then to the video provider only if both pass the safety check. Use only photos of consenting adults; review our privacy policy for provider retention and limitations.</p></article>
            <article><h3>See what comes next</h3><p>The zombie couple video generator is a one-time-purchase video tool, without credits or a recurring plan. AI video generation uses the configured provider after verified payment. Payments are server-verified, paid orders have durable attempt tracking, and definite failures can be retried without another payment while inputs remain available.</p></article>
          </div>
          <GenerateCta label="Make your zombie couple video" />
        </section>

        <section id="questions" className="faq-section wrapper"><div className="faq-side"><p className="eyebrow">A FEW GOOD QUESTIONS</p><h2>Everything you <em>need to know.</em></h2><p>Considering a zombie couple video? Here are the practical details about the tool, photo permissions, one-time payment, and what happens when a generation does not work.</p></div><div className="faq-list">{questions.map(({question,answer}) => <details key={question} className="faq-item"><summary>{question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}<GenerateCta label="Ready? Go to the generator" /></div></section>

        <section className="bottom-cta wrapper" aria-labelledby="related-template-heading"><div><p className="eyebrow">EXPLORE ANOTHER TWO-PHOTO TEMPLATE</p><h2 id="related-template-heading">A new scene. <em>A playful little move.</em></h2><p>Try the Tiptoeing In My Jordans AI video generator: two portraits, a trend-inspired dance interaction, and the same simple one-time checkout.</p></div><a href="/video/tiptoeing-in-my-jordans" className="bottom-link">Try the tiptoeing template <ArrowRight size={19}/></a></section>

        <section className="bottom-cta wrapper"><div><p className="eyebrow">READY TO SEE THE IDEA?</p><h2>Every great story <em>starts with two.</em></h2><p>Explore the zombie couple video generator with two portraits. When secure checkout is configured, an approved, verified purchase can generate one 8-second video.</p></div><a href="#generator" className="bottom-link">Try the tool <ArrowRight size={19}/></a></section>
      </main>

      <footer className="footer"><div className="wrapper footer-inner"><div><a className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></a><p>A little love beyond the end of the world.</p></div><nav className="footer-nav" aria-label="Footer"><a href="#generator">The tool</a><a href="#questions">FAQ</a><a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/acceptable-use">Acceptable Use</a><a href="/refund-policy">Refund &amp; Delivery</a><a href="/contact">Contact</a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Zombie Video Lab. AI stories for entertainment.</span><span>One-time checkout · no subscription</span></div></div></footer>
    </div>
  );
}
