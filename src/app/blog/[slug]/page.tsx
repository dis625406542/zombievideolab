import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS, MEME_GUIDE, MEME_GUIDE_PATH, TIPTOEING_PATH } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return BLOG_POSTS.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== MEME_GUIDE.slug) notFound();
  const { title, description, image, publishedAt, modifiedAt } = MEME_GUIDE;
  return { title, description, alternates: { canonical: MEME_GUIDE_PATH },
    openGraph: { title, description, url: MEME_GUIDE_PATH, type: "article", siteName: SITE_NAME, publishedTime: publishedAt, modifiedTime: modifiedAt, authors: [SITE_NAME], images: [{ url: image, width: 1200, height: 630, alt: "Tiptoeing In My Jordans two-photo video template" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const questions = [
  { question: "Do I need a prompt or an account?", answer: "No. The generator supplies the prepared storyboard and motion reference. Choose two authorized adult photos, a resolution and an aspect ratio. There is no registration, subscription or credit bundle." },
  { question: "Is there a free video or an instant photo mockup?", answer: "No free generation or instant AI photo mockup is offered. You can watch the published reference and real generated example without paying. Your own video requires a one-time purchase at the price shown by the tool." },
  { question: "Does it copy the original song?", answer: "New generations request AI-created instrumental music inspired by the reference’s tempo, groove and mood. They do not include a licensed copy of the original track. The provider may vary the music, and exact choreography, melody or beat matching is not guaranteed. The older published real-result example is silent." },
  { question: "Can I download it and post it on TikTok?", answer: "A completed result is available as an MP4. Select 9:16 for a portrait composition, download within three days and use only photos and audio you are allowed to share. Follow TikTok’s current AI-content and music rules. We do not guarantee platform approval, reach or virality." },
  { question: "What if generation fails after I pay?", answer: "A confirmed failure may qualify for a retry on the same paid order, subject to the retry allowance and photo-retention window. If submission status is uncertain, contact support with the video code instead of paying again. See the Refund & Delivery Policy for details." },
];

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  if (slug !== MEME_GUIDE.slug) notFound();
  const schema = [
    { "@context": "https://schema.org", "@type": "BlogPosting", headline: MEME_GUIDE.title, description: MEME_GUIDE.description, image: `${SITE_URL}${MEME_GUIDE.image}`, datePublished: MEME_GUIDE.publishedAt, dateModified: MEME_GUIDE.modifiedAt, mainEntityOfPage: `${SITE_URL}${MEME_GUIDE_PATH}`, url: `${SITE_URL}${MEME_GUIDE_PATH}`, inLanguage: "en", author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/about` }, publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL }, about: { "@type": "SoftwareApplication", name: "Tiptoeing In My Jordans AI Video Generator", url: `${SITE_URL}${TIPTOEING_PATH}`, applicationCategory: "MultimediaApplication", operatingSystem: "Web browser" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: MEME_GUIDE.title, item: `${SITE_URL}${MEME_GUIDE_PATH}` },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return <main className="blog-main article-wrap wrapper" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className="article-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Blog</Link><span aria-hidden="true">/</span><span>Tiptoeing meme guide</span></nav>
    <article>
      <header className="article-header"><p className="eyebrow">MEME VIDEO GUIDE</p><h1>{MEME_GUIDE.title}</h1><div className="article-byline">By <Link href="/about">Zombie Video Lab</Link> · Published <time dateTime={MEME_GUIDE.publishedAt}>October 23, 2026</time> · {MEME_GUIDE.readingMinutes} min read</div></header>
      <Image className="article-cover" src={MEME_GUIDE.image} alt="The Tiptoeing In My Jordans generator uses one dancer photo and one observer photo" width={1200} height={630} priority sizes="(max-width: 880px) 100vw, 880px" />
      <div className="article-content">
        <div className="article-answer"><p><strong>Short answer:</strong> use the <Link href={TIPTOEING_PATH}>Zombie Video Lab Tiptoeing In My Jordans AI video generator</Link> if you want a prepared two-person dance scene without writing a prompt. Upload the dancer as photo 1 and the seated observer as photo 2, choose 480p or 720p and 9:16 or 16:9, then pay once for a 15-second video. No account is required, and you can download the finished MP4.</p><Link className="blog-text-link" href={`${TIPTOEING_PATH}#generator`}>Open the Tiptoeing generator <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <p className="article-disclosure">This is a first-party guide written by Zombie Video Lab about our own tool, not an independent ranking or a claim that we are the cheapest option. Features described here reflect our current templates; the live tool and checkout show current availability and prices.</p>
        <nav className="article-toc" aria-label="Article contents"><h2>In this guide</h2><ul><li><a href="#the-meme">What the meme looks like</a></li><li><a href="#choose-your-goal">Choose by format, budget or meme</a></li><li><a href="#make-your-video">How to make your own version</a></li><li><a href="#before-you-pay">What to know before paying</a></li><li><a href="#sharing">Downloads, TikTok and music</a></li><li><a href="#common-questions">Common questions</a></li></ul></nav>
        <section id="the-meme"><h2>What is the Tiptoeing In My Jordans meme?</h2><p>The recognizable idea is a playful, exaggerated tiptoe dance paired with another person watching and reacting. The footwork, the dancer’s confidence and the observer’s reaction make the contrast funny. A personalized AI version puts your chosen people into that kind of scene rather than asking you to film the dance yourself.</p><p>Our template uses a prepared storyboard and a motion-reference video to guide the scene. It is a new AI-generated interpretation, not a frame-for-frame copy, an official Jordan product or an endorsement by Nike. Watch both the reference and the separately labeled real result on the generator page to understand the difference between inspiration and actual output.</p></section>
        <section id="choose-your-goal"><h2>Choose the tool setup that fits your goal</h2><p>“Best” depends on what you need. Here is how those common search phrases translate into practical choices within Zombie Video Lab, without inventing a competitor leaderboard.</p><div className="article-choices">
          <div className="article-choice"><h3>best for TikTok-style videos</h3><p>Choose the Tiptoeing template in 9:16 for a phone-first, 15-second dance scene. Use 16:9 when the wider composition matters more.</p></div>
          <div className="article-choice"><h3>best for trying it cheaply</h3><p>Watch the examples first, then compare 480p with 720p. Within the same template, 480p is the lower-priced paid option. This is not free generation.</p></div>
          <div className="article-choice"><h3>best for making different memes</h3><p>Pick the dance template here or the zombie couple story on our homepage. There are currently two prepared templates, not an unlimited meme library.</p></div>
        </div><p>The useful distinction is control: you choose the people, their roles, resolution and composition. You do not need to maintain a subscription or buy a large credit bundle just to make one clip. That can make the workflow easier to understand for a first attempt, but AI quality and likeness still vary.</p></section>
        <section id="make-your-video"><h2>How to make a Tiptoeing In My Jordans video with two photos</h2><ol>
          <li><strong>Open the generator and watch the samples.</strong> The default reference shows the intended scene. Select the real-result example to see an actual earlier AI output; it is labeled separately and is silent.</li>
          <li><strong>Upload photo 1: the dancer.</strong> Use a clear, authorized portrait of a consenting adult. This person gets the dancing role regardless of gender. Avoid an image with multiple competing faces or a heavily obscured face.</li>
          <li><strong>Upload photo 2: the seated observer.</strong> This person watches and reacts. Upload order, not a gender setting, determines who does what. Selected photos are checked for prohibited content before generation.</li>
          <li><strong>Choose your output.</strong> The template creates a 15-second video. Select 480p or 720p, then 9:16 portrait or 16:9 landscape. The selected format and resolution are sent with the generation request.</li>
          <li><strong>Review the live price and pay once.</strong> Checkout is for one video, with no account registration or recurring plan. Keep the video code shown by the tool as an order reference.</li>
          <li><strong>Wait, play and download.</strong> Processing time depends on the provider’s queue. The progress display is an estimate, not a promise. When complete, play the result and save the MP4 to your device.</li>
        </ol><p><Link href={`${TIPTOEING_PATH}#generator`}>Start with your dancer and observer photos</Link>. You do not need to paste a prompt, edit a timeline or choose from a long list of choreography settings.</p></section>
        <section id="before-you-pay"><h2>What this generator does—and what it does not promise</h2><p><strong>What you get:</strong> a browser-based workflow on mobile or desktop, two explicit photo roles, a prepared dance scene, a 15-second output request, two resolution choices, two aspect ratios and an MP4 download after successful generation. New requests also ask the model for AI-created instrumental music inspired by the motion reference.</p><p><strong>What is not included:</strong> a free personalized video, an instant generated still-image mockup, 2K output, guaranteed exact facial identity, a licensed original soundtrack or an unlimited set of different memes. Our resolution choices are 480p and 720p; do not confuse them with another site’s 768p or 2K options.</p><p>The AI may change clothing, facial details, footwork or reactions. A request for a particular movement is guidance, not a guarantee that every shot will match the reference. If your priority is exact editing or perfectly synchronized choreography, a fixed-template AI generator may not be the right workflow.</p><p>For a confirmed paid failure, check the tool’s retry options and our <Link href="/refund-policy">Refund &amp; Delivery Policy</Link>. Do not pay again while a submission is still uncertain; ask <Link href="/contact">support</Link> to investigate using the video code.</p></section>
        <section id="sharing"><h2>Download your MP4 and prepare it for TikTok</h2><p>For TikTok-style viewing, 9:16 keeps the composition portrait-shaped. A 16:9 clip works better when you want more horizontal space around the two people. Choosing an aspect ratio does not guarantee reach or platform acceptance; you still need to review the finished result.</p><p>New generations request similar instrumental mood, tempo and groove from the reference, not an identical copy of the original music. Exact melody and beat matching are not guaranteed. If you add a track in a social app, check the license for your account type and intended use. We do not grant third-party music rights.</p><p>Save the MP4 <strong>within three days of completion</strong>. The same browser can show your private generation records after a refresh using its saved references and signed cookie; this is not permanent storage of the video in your browser. Clearing cookies, switching devices or waiting beyond the delivery period can remove access. Your code is an order reference, not a cross-device login.</p><p>Use only adult photos you are authorized to process, respect likeness rights, follow the destination platform’s AI-disclosure rules and do not portray the synthetic clip as a real event. See our <Link href="/acceptable-use">Acceptable Use Policy</Link> and <Link href="/privacy">Privacy Policy</Link> before uploading.</p></section>
        <section id="other-memes"><h2>Want a different story instead of a dance?</h2><p>Our <Link href="/">zombie couple video generator</Link> turns two consenting adult portraits into an 8-second romantic horror scene. On that template, photo 1 is the infected person and photo 2 is the rescuer. It has a different storyboard and duration from the 15-second Tiptoeing template. Pick the story you want before paying; a purchase is not a pass to every template.</p></section>
        <section className="article-faq" id="common-questions"><h2>Frequently asked questions</h2>{questions.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      </div>
      <aside className="blog-bottom-cta"><h2>Your photos. Your dancer. Your meme.</h2><p>Watch the examples, choose who dances and who watches, then check the current one-time price. No account or prompt writing required.</p><div><Link href={`${TIPTOEING_PATH}#generator`}>Create a Tiptoeing In My Jordans video <ArrowRight size={16} aria-hidden="true" /></Link></div></aside>
    </article>
  </main>;
}
