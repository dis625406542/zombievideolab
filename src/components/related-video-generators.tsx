import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { VIDEO_TEMPLATES, type TemplateId } from "@/lib/video-templates";

const previews = [
  {
    id: "zombie-couple",
    title: "Zombie Couple Video Generator",
    image: "/demo1-poster.webp",
    alt: "A rescuer searches by flashlight in the zombie couple video sample",
    label: "A FICTIONAL REUNION",
    description: "Turn two adult portraits into a fictional zombie love video: one infected character, one rescuer and an emotional reunion.",
  },
  {
    id: "tiptoeing-in-my-jordans",
    title: "Tiptoeing In My Jordans AI Video Generator",
    image: "/tiptoeing-card-cover.webp",
    alt: "A dancer tiptoes in a rustic barn while a seated observer watches in a generated video example",
    label: "A PLAYFUL DANCE",
    description: "Create a Tiptoeing In My Jordans video from two adult portraits. Your first character dances while the second watches the playful scene.",
  },
] satisfies Array<{ id: TemplateId; title: string; image: string; alt: string; label: string; description: string }>;

/** Server-rendered internal links; adding a template preview does not load any video. */
export function RelatedVideoGenerators({ currentTemplate }: { currentTemplate: TemplateId }) {
  const ordered = [...previews].sort((a, b) => Number(a.id === currentTemplate) - Number(b.id === currentTemplate));
  return <section className="related-generators wrapper" aria-labelledby="related-generators-heading">
    <div className="related-generators-heading">
      <p className="eyebrow">TWO PHOTOS. MORE WAYS TO CREATE.</p>
      <h2 id="related-generators-heading">More AI Video <em>Generators</em></h2>
      <p>Explore our two-photo video templates. Preview a different story, choose your format and create with a one-time purchase. No account or subscription needed.</p>
    </div>
    <div className="related-generators-grid">
      {ordered.map(preview => {
        const template = VIDEO_TEMPLATES[preview.id];
        const current = preview.id === currentTemplate;
        return <Link key={preview.id} className="related-generator-card" href={current ? "#generator" : template.path}>
          <div className="related-generator-cover">
            <Image src={preview.image} alt={preview.alt} fill sizes="(max-width: 650px) 100vw, (max-width: 1600px) 50vw, 760px" />
            <span className="related-generator-format">{template.durationSeconds}s <span aria-hidden="true">·</span> 480p / 720p</span>
            <span className="related-generator-play" aria-hidden="true"><Play size={23} fill="currentColor"/></span>
          </div>
          <div className="related-generator-copy">
            <div className="related-generator-label"><span>{preview.label}</span>{current && <span className="related-generator-current">ON THIS PAGE</span>}</div>
            <h3>{preview.title}</h3>
            <p>{preview.description}</p>
            <span className="related-generator-link">{current ? "Back to this generator" : "Explore this generator"}<ArrowRight size={17} aria-hidden="true"/></span>
          </div>
        </Link>;
      })}
    </div>
  </section>;
}
