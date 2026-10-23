import type { Metadata } from "next";
import { ArrowRight, Footprints, ImagePlus, ShieldCheck, Sparkles, CreditCard, Smartphone, Download, Clock3 } from "lucide-react";
import { Generator } from "@/components/generator";
import { SITE_URL } from "@/lib/site";
import { faqGroups, questions } from "./faq";
import "./template.css";

const path = "/video/tiptoeing-in-my-jordans";
const title = "Tiptoeing In My Jordans AI Video Generator";
const description = "Create a Tiptoeing In My Jordans video from two photos. Choose 480p or 720p, pay once, and download your 15-second AI video. No account needed.";
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: path },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: path, type: "website", siteName: "Zombie Video Lab", images: [{ url: "/tiptoeing-social.png", width: 1200, height: 630, alt: "Tiptoeing In My Jordans — two photos, one playful AI video" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/tiptoeing-social.png"] },
};


function Cta({ label = "Create your Tiptoeing In My Jordans video" }: { label?: string }) {
  return <div className="section-generate-cta"><a href="#generator" className="generate-link">{label}<ArrowRight size={18} aria-hidden="true" /></a><span>Two photos · One-time purchase · No login</span></div>;
}
function Brand() {
  return <a className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></a>;
}

export default function TiptoeingPage() {
  const structuredData = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tiptoeing In My Jordans", item: `${SITE_URL}${path}` },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return <div className="page-shell tiptoe-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className="site-header"><div className="nav-content"><Brand/><nav className="nav-links" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#questions">FAQ</a><a className="nav-action" href="#generator">Create video <ArrowRight size={14}/></a></nav></div></header>
    <main>
      <div className="announcement">A NEW MOVE. YOUR TWO CHARACTERS. <span className="announcement-flame">✦</span> PAY ONCE, CREATE ONCE.</div>
      <section className="hero wrapper" aria-labelledby="main-heading">
        <nav className="tiptoe-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Tiptoeing In My Jordans</span></nav>
        <div className="hero-heading"><p className="eyebrow">TWO PHOTOS. A LITTLE FOOTWORK.</p><h1 id="main-heading">Tiptoeing In My Jordans <em>AI Video Generator</em></h1><p className="hero-subtitle">Create a 15-second Tiptoeing In My Jordans video from your two photos. One dancer, one seated observer and a playful, reference-guided scene. Choose your quality, pay once, and let the scene unfold.</p></div>
        <Generator templateId="tiptoeing-in-my-jordans" />
        <p className="hero-note"><ShieldCheck size={16} aria-hidden="true"/> Photos are screened before generation. No subscription. No account required.</p>
      </section>
      <section className="trust-row wrapper" aria-label="Template highlights"><div><ImagePlus size={17}/>Two photo roles</div><div><Footprints size={17}/>Playful footwork</div><div><CreditCard size={17}/>Pay per video</div><div><Smartphone size={17}/>Mobile friendly</div></section>
      <section id="how-it-works" className="tiptoe-section wrapper">
        <div className="tiptoe-section-title"><p className="eyebrow">FROM PORTRAITS TO A PLAYFUL SCENE</p><h2>How to make a <em>Tiptoeing In My Jordans video.</em></h2><p>The Tiptoeing In My Jordans AI video generator keeps the setup simple. You choose the characters; the template supplies the scene.</p></div>
        <div className="tiptoe-cards tiptoe-steps">
          <article><span className="tiptoe-step">01 / UPLOAD</span><ImagePlus aria-hidden="true"/><h3>Give each photo a role</h3><p>Start your Tiptoeing In My Jordans video with the dancer first, then the person reacting. Choose clear, separate portraits of adults who have agreed to appear. We screen each photo as you select it.</p></article>
          <article><span className="tiptoe-step">02 / CHECK OUT</span><CreditCard aria-hidden="true"/><h3>Choose quality. Pay once.</h3><p>Choose 480p or 720p for your Tiptoeing In My Jordans video, then vertical or landscape. Review the live price, keep your video code and complete secure checkout. A payment return alone never authorizes generation; the server verifies it.</p></article>
          <article><span className="tiptoe-step">03 / GENERATE</span><Clock3 aria-hidden="true"/><h3>Follow the 15-second render</h3><p>After payment is verified, your Tiptoeing In My Jordans video starts generating. The progress bar is an estimate; rendering can take several minutes. Keep your video code. Refreshing this browser will recover the order without another purchase.</p></article>
          <article><span className="tiptoe-step">04 / PLAY &amp; DOWNLOAD</span><Download aria-hidden="true"/><h3>Choose your video. Save the MP4.</h3><p>Find your finished Tiptoeing In My Jordans video under Your videos. Tap its thumbnail to play it in the large player, check the quality, duration and format, then download. Save within three days; use Watch sample video to return to the preview.</p></article>
        </div><Cta/>
      </section>
      <section id="example-results" className="tiptoe-section wrapper" aria-labelledby="tiptoe-examples-title">
        <div className="tiptoe-section-title"><p className="eyebrow">FROM UPLOADED PHOTOS TO MOVING CHARACTERS</p><h2 id="tiptoe-examples-title">See a Tiptoeing In My Jordans <em>generation in action.</em></h2><p>These screenshots show one Tiptoeing In My Jordans result made with two portraits. Follow the upload order, choose your settings and let the prepared scene bring the two characters together. They illustrate a previous result, not a promise of identical output.</p></div>
        <div className="tiptoe-walkthrough">
          <figure>
            <div className="tiptoe-example-heading"><span>01 / YOUR PHOTOS, IN THE SCENE</span><span>15s AI VIDEO</span></div>
            <a href="/tiptoeing-walkthrough-1.webp" target="_blank" rel="noopener noreferrer" aria-label="Open the first Tiptoeing In My Jordans example screenshot full size"><img src="/tiptoeing-walkthrough-1.webp" width={1496} height={856} loading="lazy" decoding="async" alt="Tiptoeing In My Jordans generator with a dancer portrait first, an observer portrait second, and the generated scene playing beside them"/></a>
            <figcaption><h3>Tiptoeing In My Jordans starts with your two characters</h3><p>The first image sets the dancer; the second sets the seated observer. In this Tiptoeing In My Jordans example, the portraits and the finished interaction appear side by side. The template asks the model to retain each person’s identity and outfit; faces, clothing and expressions can still vary.</p></figcaption>
          </figure>
          <figure>
            <div className="tiptoe-example-heading"><span>02 / THE FOOTWORK &amp; REACTION</span><span>DOWNLOAD AS MP4</span></div>
            <a href="/tiptoeing-walkthrough-2.webp" target="_blank" rel="noopener noreferrer" aria-label="Open the second Tiptoeing In My Jordans example screenshot full size"><img src="/tiptoeing-walkthrough-2.webp" width={1514} height={866} loading="lazy" decoding="async" alt="Tiptoeing In My Jordans AI video result showing a full-body dancer tiptoeing in a barn while the seated second character watches"/></a>
            <figcaption><h3>Tiptoeing In My Jordans adds movement and a playful reaction</h3><p>Later in this Tiptoeing In My Jordans result, the dancer moves into a full-body tiptoe while the other character watches. The 15-second template requests expressive gestures, footwork and a reaction shot. Your Tiptoeing In My Jordans video uses the selected 480p or 720p quality and portrait or landscape format, with no licensed soundtrack included.</p></figcaption>
          </figure>
        </div>
        <Cta label="Create your own Tiptoeing In My Jordans scene"/>
      </section>
      <section className="tiptoe-section wrapper" aria-labelledby="tiptoe-benefits-heading">
        <div className="tiptoe-section-title"><p className="eyebrow">BUILT AROUND YOUR TWO PHOTOS</p><h2 id="tiptoe-benefits-heading">Why try our <em>Tiptoeing In My Jordans generator?</em></h2><p>A focused workflow for one playful clip, without a general-purpose editing dashboard.</p></div>
        <div className="tiptoe-cards">
          <article><ImagePlus aria-hidden="true"/><h3>Your people, clearly assigned</h3><p>Tiptoeing In My Jordans uses separate dancer and observer photos. The prompt keeps those roles fixed and asks for consistent faces and outfits throughout the scene, rather than choosing roles by gender.</p></article>
          <article><Footprints aria-hidden="true"/><h3>A prepared 15-second story</h3><p>The Tiptoeing In My Jordans template combines an ordered storyboard and a motion reference: a shushing gesture, expressive reactions, full-body tiptoeing and a footwork close-up. No prompt-writing experience is needed; AI results can vary.</p></article>
          <article><Smartphone aria-hidden="true"/><h3>One purchase, a downloadable clip</h3><p>Make Tiptoeing In My Jordans in a mobile-friendly tool without registering an account. Pick 480p or 720p, confirm the displayed price, then save your finished MP4 within three days. There are no subscription plans.</p></article>
        </div><Cta/>
      </section>
      <section className="tiptoe-section wrapper tiptoe-details">
        <div><p className="eyebrow">THE IDEA BEHIND THE TEMPLATE</p><h2>Your Tiptoeing In My Jordans scene. <em>Your two characters.</em></h2><p>Turn a pair of portraits into a lighthearted scene: the first character begins a tiptoe shuffle, the seated second character reacts with surprise, with a dedicated shoe close-up showing the footwork. The Tiptoeing In My Jordans template combines your two identity photos with a motion reference for a warm, rustic barn scene. Photo 1 always dances; photo 2 remains the seated observer.</p><p>Use Tiptoeing In My Jordans for a playful couple interaction, a friendly reaction clip or a short visual for your own social post. The result is AI-generated entertainment; facial details and movement can vary.</p><Cta label="Make Tiptoeing In My Jordans from photos"/></div>
        <div className="tiptoe-guide"><span className="tiptoe-step">YOUR PHOTO CHECKLIST</span><h3>Clear faces. Consistent characters.</h3><ul><li><strong>One adult per photo.</strong> Avoid groups, collages, heavy filters and hidden faces.</li><li><strong>Put the dancer first.</strong> The second upload is the reaction character, whatever their gender.</li><li><strong>Show the outfit.</strong> Clear clothing and well-lit portraits help the model keep each person recognizable. Results are not guaranteed.</li><li><strong>Keep it yours to use.</strong> Get consent. No sexual content, graphic violence or prohibited impersonation.</li></ul><a className="tiptoe-text-link" href="/acceptable-use">Read the upload rules <ArrowRight size={15}/></a></div>
      </section>
      <section className="tiptoe-section wrapper">
        <div className="tiptoe-section-title"><p className="eyebrow">FIT THE WAY YOU SHARE</p><h2>Tiptoeing In My Jordans formats. <em>One 15-second clip.</em></h2></div>
        <div className="tiptoe-format-grid"><article><span className="tiptoe-frame portrait" aria-hidden="true"/><div><h3>9:16 · Vertical</h3><p>A vertical Tiptoeing In My Jordans video for phone-first viewing. The prompt asks for the performer's head and feet to stay visible during the footwork.</p></div></article><article><span className="tiptoe-frame landscape" aria-hidden="true"/><div><h3>16:9 · Landscape</h3><p>A landscape Tiptoeing In My Jordans video gives both characters room side by side. Your chosen ratio is sent to the video provider, not just applied to the player.</p></div></article></div>
        <p className="tiptoe-disclaimer">480p and 720p · 15-second target · MP4 download. This is a trend-inspired visual template, not an exact choreography or original-song reproduction. No licensed soundtrack is included.</p><Cta label="Choose your Tiptoeing In My Jordans format"/>
      </section>
      <section id="questions" className="faq-section wrapper"><div className="faq-side"><p className="eyebrow">BEFORE YOUR FIRST MOVE</p><h2>Tiptoeing In My Jordans <em>questions, answered.</em></h2><p>Practical answers about the Tiptoeing In My Jordans generator, photo roles, payments and keeping your video.</p><a className="tiptoe-text-link" href="/contact">Need help? Contact us <ArrowRight size={15}/></a></div><div className="faq-list">{faqGroups.map(group => <section key={group.title} className="tiptoe-faq-group" aria-label={group.title}><h3>{group.title}</h3>{group.questions.map(({ question, answer }) => <details key={question} className="faq-item"><summary>{question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</section>)}<Cta label="Try the Tiptoeing In My Jordans generator"/></div></section>
      <section className="bottom-cta wrapper"><div><p className="eyebrow">LOOKING FOR A DIFFERENT STORY?</p><h2>From playful moves <em>to zombie love.</em></h2><p>Try our original two-photo zombie couple video template for a fictional, non-graphic reunion scene.</p></div><a href="/#generator" className="bottom-link">Explore zombie videos <ArrowRight size={19}/></a></section>
    </main>
    <footer className="footer"><div className="wrapper footer-inner"><div><Brand/><p>Original AI moments. Made for entertainment.</p></div><nav className="footer-nav" aria-label="Footer"><a href="#generator">Create video</a><a href="/about">About</a><a href="/security">Security</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/acceptable-use">Acceptable Use</a><a href="/refund-policy">Refund &amp; Delivery</a><a href="/contact">Contact</a></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Zombie Video Lab.</span><span>Independent template · Not affiliated with Nike or Jordan</span></div></div></footer>
  </div>;
}
