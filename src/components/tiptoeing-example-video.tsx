"use client";

import { useState } from "react";

/** Owner-authorized output from this template, not the source motion reference. */
export function TiptoeingExampleVideo() {
  const [failed, setFailed] = useState(false);
  return <div className="demo-player tiptoe-reference">
    <div className="demo-format-strip" aria-label="Real AI-generated result, 480p, 15 seconds, 16:9 landscape, silent">
      <span className="demo-format-title"><span className="demo-status-dot"/> REAL AI RESULT</span>
      <div className="demo-format-tags"><span>480p</span><span>15s</span><span>16:9</span></div>
    </div>
    <div className="demo-media">
      {failed ? <div className="tiptoe-reference-fallback" role="status">
        <img src="/tiptoeing-example-poster.webp" alt="Still from a real Tiptoeing In My Jordans AI-generated video"/>
        <span>Sample playback is unavailable. Please try again later.</span>
      </div> : <video src="/tiptoeing-example-v1.mp4" poster="/tiptoeing-example-poster.webp"
        width={854} height={480} controls autoPlay muted loop playsInline preload="metadata"
        aria-label="Real 15-second Tiptoeing In My Jordans AI result, 480p landscape, no soundtrack"
        onError={() => setFailed(true)}
      >Your browser does not support video playback.</video>}
    </div>
    <p className="tiptoe-reference-note">Real output created with this template from two photos. Silent video; no song included. Faces, details and motion can vary between generations.</p>
  </div>;
}
