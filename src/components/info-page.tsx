import type { ReactNode } from "react";
import { CONTACT_EMAIL, UPDATED } from "@/lib/info";

type Section = { title: string; content: ReactNode };

export function InfoPage({ label, title, introduction, sections }: {
  label: string;
  title: string;
  introduction: string;
  sections: Section[];
}) {
  return (
    <div className="page-shell info-shell">
      <header className="site-header"><div className="nav-content"><a className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></a><nav className="nav-links" aria-label="Main navigation"><a href="/about">About</a><a href="/contact">Contact</a><a className="public-blog-link" href="/blog">Blog</a><a className="nav-action" href="/#generator">Explore the tool</a></nav></div></header>
      <main className="info-main wrapper">
        <a className="info-back" href="/">← Back to the tool</a>
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p className="info-lead">{introduction}</p>
        <p className="info-updated">Last updated: {UPDATED}</p>
        <div className="info-sections">{sections.map(({ title: heading, content }) => <section key={heading}><h2>{heading}</h2><div>{content}</div></section>)}</div>
        <p className="info-contact">Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · <a href="/contact">Contact and support</a></p>
      </main>
      <footer className="info-footer wrapper"><a href="/">Home</a><a href="/blog">Blog</a><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/acceptable-use">Acceptable Use</a><a href="/refund-policy">Refund policy</a><a href="/security">Security</a><a href="/contact">Contact</a></footer>
    </div>
  );
}
