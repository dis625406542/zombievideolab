import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { tinyGuides } from "@/lib/tiny-guides";

export function generateStaticParams() { return tinyGuides.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = tinyGuides.find(guide => guide.slug === slug);
  if (!guide) return {};
  return { title: `${guide.title} | Tiny Desk AI Videos`, description: guide.description, alternates: { canonical: `/blog/${slug}` } };
}
export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = tinyGuides.find(guide => guide.slug === slug);
  if (!guide) notFound();
  return <div className="tiny-site"><SiteHeader /><main className="tiny-article"><a className="tiny-article-back" href="/blog">← All guides</a><p className="tiny-kicker">THE JOURNAL</p><h1>{guide.title}</h1><p className="tiny-article-lead">{guide.description}</p><p className="tiny-guide-meta">{guide.date} · {guide.minutes}</p><div className={`tiny-article-image tiny-guide-image ${guide.imageClass}`}><img src={guide.image} alt="Illustrated concert setting, not a generated video" /><span>CONCEPT ART</span></div><div className="tiny-article-content">{guide.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="tiny-article-cta"><strong>Your stage is waiting.</strong><p>See the concept studio and planned one-time pricing. Video generation is coming soon.</p><a href="/#studio">Explore the studio →</a></div></div></main><SiteFooter /></div>;
}
