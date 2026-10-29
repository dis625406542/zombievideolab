import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { TinyGuides } from "@/components/tiny-guides";

export const metadata: Metadata = { title: "Tiny Desk AI Guides | Tiny Desk AI Videos", description: "Guides to the Tiny Desk AI concert-inspired look, portraits and our planned studio.", alternates: { canonical: "/blog" } };
export default function BlogPage() { return <div className="tiny-site"><SiteHeader /><main className="tiny-blog-main"><TinyGuides /></main><SiteFooter /></div>; }
