"use client";

import { useState } from "react";

const previews = {
  reference: {
    src: "/tiptoeing-reference.mp4", poster: "/tiptoeing-reference-poster.jpeg",
    width: 854, height: 486, tags: ["854 × 486", "15s", "Landscape"],
    label: "Original Tiptoeing In My Jordans movement and music reference",
    note: "Original movement and music reference. Muted by default; unmute the player to listen. New generations request similar AI-created background music, not an identical song or perfectly matched choreography.",
  },
  result: {
    src: "/tiptoeing-example-v1.mp4", poster: "/tiptoeing-example-poster.webp",
    width: 854, height: 480, tags: ["480p", "15s", "16:9"],
    label: "Real 15-second Tiptoeing In My Jordans AI result, 480p landscape, older silent example",
    note: "Real output created from two photos. This earlier example has no soundtrack; new generations request AI-created music. Faces, details, motion and musical timing can vary between generations.",
  },
} as const;

/** The original reference is always the initial preview, not a private order or the older result. */
export function TiptoeingExampleVideo() {
  const [selected, setSelected] = useState<keyof typeof previews>("reference");
  const [failed, setFailed] = useState(false);
  const preview = previews[selected];
  return <div className="demo-player tiptoe-reference">
    <div className="demo-format-strip tiptoe-preview-toolbar">
      <div className="tiptoe-preview-switch" role="group" aria-label="Choose a public video preview">
        <button type="button" aria-pressed={selected === "reference"} onClick={() => { setSelected("reference"); setFailed(false); }}>Reference</button>
        <button type="button" aria-pressed={selected === "result"} onClick={() => { setSelected("result"); setFailed(false); }}>Real result</button>
      </div>
      <div className="demo-format-tags" aria-label="Preview video format">{preview.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
    <div className="demo-media">
      {failed ? <div className="tiptoe-reference-fallback" role="status">
        <img src={preview.poster} alt={`Still from ${preview.label}`}/>
        <span>Preview playback is unavailable. Try switching previews or refresh the page.</span>
      </div> : <video key={selected} src={preview.src} poster={preview.poster}
        width={preview.width} height={preview.height} controls autoPlay muted loop playsInline preload="metadata"
        aria-label={preview.label} onError={() => setFailed(true)}
      >Your browser does not support video playback.</video>}
    </div>
    <p className="tiptoe-reference-note" aria-live="polite">{preview.note}</p>
  </div>;
}
