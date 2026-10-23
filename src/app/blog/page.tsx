import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { BLOG_POSTS, formatBlogDate } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "AI Meme Video Guides & Tutorials | Zombie Video Lab Blog";
const description = "Learn how to turn two photos into AI meme videos. Practical guides to Tiptoeing In My Jordans, TikTok formats, one-time purchases and downloads.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/blog" },
  openGraph: { title, description, url: "/blog", type: "website", siteName: SITE_NAME, images: ["/tiptoeing-social.png"] },
  twitter: { card: "summary_large_image", title, description, images: ["/tiptoeing-social.png"] },
};

export default function BlogPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "Blog", name: "Zombie Video Lab Blog", url: `${SITE_URL}/blog`, description,
    blogPost: BLOG_POSTS.map(post => ({ "@type": "BlogPosting", headline: post.title, url: `${SITE_URL}/blog/${post.slug}`, datePublished: post.publishedAt, dateModified: post.modifiedAt, author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/about` } })),
  };
  return <main className="blog-main blog-index wrapper" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="blog-intro">
      <p className="eyebrow">GUIDES · IDEAS · HOW-TOS</p>
      <h1>AI Meme Video <em>Blog</em></h1>
      <p>From viral inspiration to your own video. Practical guides to choosing your cast, recreating the scene and making a meme worth sharing.</p>
    </header>
    <section className="blog-grid" aria-label="Latest articles">
      {BLOG_POSTS.map(post => <article className="blog-card" key={post.slug}>
        <div className="blog-card-body">
          <div className="blog-meta">
            <span className="blog-meta-item"><CalendarDays size={14} aria-hidden="true" /><time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time></span>
            <span className="blog-meta-item"><Clock3 size={14} aria-hidden="true" />{post.readingMinutes} min read</span>
          </div>
          <p className="blog-category">{post.category}</p>
          <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
          <p className="blog-excerpt">{post.description}</p>
          <Link className="blog-text-link" href={`/blog/${post.slug}`} aria-label={`Read article: ${post.title}`}>Read Article <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </article>)}
    </section>
    <aside className="blog-bottom-cta">
      <h2>Already know the meme you want?</h2>
      <p>Choose the Tiptoeing dance or a zombie couple story. Each tool shows its current one-time price before checkout.</p>
      <div><Link href="/video/tiptoeing-in-my-jordans#generator">Make a Tiptoeing video <ArrowRight size={16} aria-hidden="true" /></Link><Link href="/#generator">Try the zombie couple template <ArrowRight size={16} aria-hidden="true" /></Link></div>
    </aside>
  </main>;
}
