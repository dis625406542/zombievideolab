import { ArrowRight } from "lucide-react";
import { tinyGuides } from "@/lib/tiny-guides";

export function TinyGuides({ compact = false }: { compact?: boolean }) {
  return <section id="guides" className={`tiny-section tiny-guides ${compact ? "tiny-guides-home" : ""}`} aria-labelledby="guides-title">
    <div className="tiny-guides-head"><div><span className="tiny-kicker">THE JOURNAL</span>{compact ? <h2 id="guides-title">Tiny Desk AI <em>guides.</em></h2> : <h1 id="guides-title">Tiny Desk AI <em>guides.</em></h1>}<p>Get to know the concert-inspired look, and prepare your best photo before the studio opens.</p></div>{compact && <a href="/blog" className="tiny-guides-all">All guides <ArrowRight size={18} /></a>}</div>
    <div className="tiny-guide-grid">{tinyGuides.map(guide => <article className="tiny-guide-card" key={guide.slug}><a href={`/blog/${guide.slug}`} aria-label={`Read ${guide.title}`}><div className={`tiny-guide-image ${guide.imageClass}`}><img src={guide.image} alt="Illustrated desk-side concert concept, not a generated video" /><span>CONCEPT ART</span></div><div className="tiny-guide-body"><p className="tiny-guide-meta">{guide.date} · {guide.minutes}</p><h3>{guide.title}</h3><p>{guide.description}</p><span className="tiny-guide-read">Read the guide <ArrowRight size={18} /></span></div></a></article>)}</div>
  </section>;
}
