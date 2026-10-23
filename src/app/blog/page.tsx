import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "AI Meme Video Guides & Tutorials | Zombie Video Lab Blog";
const description = "Learn how to turn two photos into AI meme videos. Practical guides to Tiptoeing In My Jordans, TikTok formats, one-time purchases and downloads.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/blog" },
  openGraph: { title, description, url: "/blog", type: "website", siteName: SITE_NAME, images: ["/tiptoeing-social.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/tiptoeing-social.png"] },
};

export default function BlogPage() {
  const schema = { "@context": "https://schema.org", "@type": "Blog", name: "Zombie Video Lab Blog", url: `${SITE_URL}/blog`, description,
    blogPost: BLOG_POSTS.map(post => ({ "@type": "BlogPosting", headline: post.title, url: `${SITE_URL}/blog/${post.slug}`, datePublished: post.publishedAt, dateModified: post.modifiedAt, author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/about` } })) };
  return <main className="blog-main wrapper" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <div className="blog-intro"><p className="eyebrow">THE ZOMBIE VIDEO LAB BLOG</p><h1>AI meme video guides.<br /><em>Less guessing. More creating.</em></h1><p>Understand the meme, choose your photo roles and make a video you can download. Clear guides from the team building Zombie Video Lab, with real capabilities and limitations explained.</p></div>
    <section className="blog-grid" aria-label="Latest articles">{BLOG_POSTS.map(post => <article className="blog-card" key={post.slug}>
      <Link href={`/blog/${post.slug}`} className="blog-card-image" aria-label={post.title}><Image src={post.image} alt="Two-photo Tiptoeing In My Jordans AI video template" width={1200} height={630} sizes="(max-width: 700px) 100vw, 580px" /></Link>
      <div className="blog-card-body"><div className="blog-meta"><time dateTime={post.publishedAt}>October 23, 2026</time><span>{post.readingMinutes} min read</span></div><p className="blog-category">{post.category}</p><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.description}</p><Link className="blog-text-link" href={`/blog/${post.slug}`}>Read the guide <ArrowRight size={16} aria-hidden="true" /></Link></div>
    </article>)}</section>
    <aside className="blog-bottom-cta"><h2>Already know the meme you want?</h2><p>Choose the Tiptoeing dance or a zombie couple story. Each tool shows its current one-time price before checkout.</p><div><Link href="/video/tiptoeing-in-my-jordans#generator">Make a Tiptoeing video <ArrowRight size={16} /></Link><Link href="/#generator">Try the zombie couple template <ArrowRight size={16} /></Link></div></aside>
  </main>;
}
