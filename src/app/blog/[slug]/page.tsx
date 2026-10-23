import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS, RECREATE_GUIDE, TIPTOEING_PATH, formatBlogDate } from "@/lib/blog";
import { ToolGuide, toolGuideQuestions } from "@/components/blog/tool-guide";
import { RecreateGuide, recreateGuideQuestions } from "@/components/blog/recreate-guide";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

function getPost(slug: string) {
  const post = BLOG_POSTS.find(post => post.slug === slug);
  if (!post) notFound();
  return post;
}

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { title, description, image, publishedAt, modifiedAt } = getPost(slug);
  const path = `/blog/${slug}`;
  return {
    title, description, alternates: { canonical: path },
    openGraph: {
      title, description, url: path, type: "article", siteName: SITE_NAME,
      publishedTime: publishedAt, modifiedTime: modifiedAt, authors: [SITE_NAME],
      images: [{ url: image, width: 1200, height: 630, alt: "Tiptoeing In My Jordans two-photo video template" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  const isRecreateGuide = post.slug === RECREATE_GUIDE.slug;
  const questions = isRecreateGuide ? recreateGuideQuestions : toolGuideQuestions;
  const path = `/blog/${post.slug}`;
  const relatedPosts = BLOG_POSTS.filter(other => other.slug !== post.slug);
  const schema = [
    {
      "@context": "https://schema.org", "@type": "BlogPosting",
      headline: post.title, description: post.description, image: `${SITE_URL}${post.image}`,
      datePublished: post.publishedAt, dateModified: post.modifiedAt,
      mainEntityOfPage: `${SITE_URL}${path}`, url: `${SITE_URL}${path}`, inLanguage: "en",
      author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/about` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      about: { "@type": "SoftwareApplication", name: "Tiptoeing In My Jordans AI Video Generator", url: `${SITE_URL}${TIPTOEING_PATH}`, applicationCategory: "MultimediaApplication", operatingSystem: "Web browser" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}${path}` },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];
  return <main className="blog-main article-wrap wrapper" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className="article-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Blog</Link><span aria-hidden="true">/</span><span aria-current="page">{post.category}</span></nav>
    <article>
      <header className="article-header">
        <p className="eyebrow">{post.category.toUpperCase()}</p>
        <h1>{post.title}</h1>
        <div className="article-byline">By <Link href="/about">Zombie Video Lab</Link> · Published <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time> · {post.readingMinutes} min read</div>
      </header>
      <Image className="article-cover" src={post.image} alt="The Tiptoeing In My Jordans generator uses one dancer photo and one observer photo" width={1200} height={630} priority sizes="(max-width: 880px) 100vw, 880px" />
      <div className="article-content">
        {isRecreateGuide ? <RecreateGuide /> : <ToolGuide />}
        <section className="article-faq" id="common-questions">
          <h2>Frequently asked questions</h2>
          {questions.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </section>
        <aside className="article-related" aria-labelledby="related-guide-title">
          <h2 id="related-guide-title">Keep exploring</h2>
          {relatedPosts.map(related => <p key={related.slug}><Link href={`/blog/${related.slug}`}>{related.title}</Link></p>)}
        </aside>
      </div>
      <aside className="blog-bottom-cta">
        <h2>Your photos. Your dancer. Your meme.</h2>
        <p>Watch the examples, choose who dances and who watches, then check the current one-time price. No account or prompt writing required.</p>
        <div><Link href={`${TIPTOEING_PATH}#generator`}>Create a Tiptoeing In My Jordans video <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </aside>
    </article>
  </main>;
}
