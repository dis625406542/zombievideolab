import { ArrowRight, Mic2 } from "lucide-react";

export function SiteHeader() {
  return <header className="tiny-header"><div className="tiny-nav-wrap">
    <a className="tiny-brand" href="/" aria-label="Tiny Desk AI Videos home"><span className="tiny-brand-icon" aria-hidden="true"><Mic2 size={19} strokeWidth={2.5} /><span>✦</span></span><span>Tiny Desk <em>AI</em> Videos</span></a>
    <nav className="tiny-nav" aria-label="Main navigation"><a href="/#how-it-works">How it works</a><a href="/#pricing">Pricing</a><a href="/blog">Blog</a><a href="/#faq">FAQ</a></nav>
    <a className="tiny-nav-cta" href="/#studio">Make my video <ArrowRight size={17} aria-hidden="true" /></a>
    <details className="tiny-mobile-menu"><summary aria-label="Open menu">☰</summary><nav aria-label="Mobile navigation"><a href="/#studio">Studio</a><a href="/#how-it-works">How it works</a><a href="/#pricing">Pricing</a><a href="/blog">Blog</a><a href="/#faq">FAQ</a></nav></details>
  </div></header>;
}

export function SiteFooter() {
  return <footer className="tiny-footer"><div className="tiny-footer-inner"><div className="tiny-footer-columns">
    <div className="tiny-footer-about"><a className="tiny-brand" href="/" aria-label="Tiny Desk AI Videos home"><span className="tiny-brand-icon" aria-hidden="true"><Mic2 size={19} /></span><span>Tiny Desk <em>AI</em> Videos</span></a><p>A cozy concert-inspired moment, with you behind the mic. Our studio is a visual preview while video creation is in development.</p></div>
    <nav aria-label="Tiny Desk AI Videos"><h3>Tiny Desk AI Videos</h3><a href="/#studio">The studio</a><a href="/#how-it-works">How it works</a><a href="/#pricing">Pricing</a><a href="/#faq">FAQ</a><a href="/blog">Blog</a></nav>
    <nav aria-label="Guides"><h3>Guides</h3><a href="/blog/tiny-desk-ai-video-guide">How to make a video</a><a href="/blog/tiny-desk-ai-trend-explained">About the trend</a><a href="/blog/tiny-desk-ai-photo-tips">Photo tips</a><a href="/blog/tiny-desk-ai-prompt-ideas">Prompt ideas</a><a href="/blog/tiny-desk-ai-music-lip-sync">Music &amp; lip sync</a><a href="/blog/tiny-desk-ai-filter-pricing">Filters &amp; pricing</a><a href="/blog">All guides</a></nav>
    <div className="tiny-footer-legal" id="privacy-note"><h3>Legal &amp; info</h3><p>Independent concept. Not affiliated with or endorsed by NPR or Tiny Desk Concerts.</p><p>Photos chosen in this preview stay on your device; no video is generated or payment collected. Full legal policies will be published before launch.</p></div>
  </div><p className="tiny-footer-bottom">© {new Date().getFullYear()} Tiny Desk AI Videos. Independent, unofficial concept. Video creation and checkout are not yet available.</p></div></footer>;
}
