import { VideoGeneratorsNav } from "@/components/video-generators-nav";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./blog.css";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="page-shell blog-shell">
    <header className="site-header"><div className="nav-content">
      <Link className="brand" href="/" aria-label="Zombie Video Lab home"><span className="brand-mark" aria-hidden="true"><span className="brand-pulse">✳</span></span><span>ZOMBIE<span className="brand-light">VIDEO</span>LAB<span className="brand-dot">.</span></span></Link>
      <nav className="nav-links" aria-label="Main navigation"><VideoGeneratorsNav/><Link className="public-blog-link" href="/blog">Blog</Link><Link className="nav-action" href="/video/tiptoeing-in-my-jordans#generator">Create video <ArrowRight size={14} aria-hidden="true" /></Link></nav>
    </div></header>
    {children}
    <footer className="blog-footer wrapper"><p>Zombie Video Lab · Two photos. Your own AI story.</p><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/blog">Blog</Link><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/acceptable-use">Acceptable use</Link><Link href="/refund-policy">Refund policy</Link><Link href="/contact">Contact</Link></nav></footer>
  </div>;
}
