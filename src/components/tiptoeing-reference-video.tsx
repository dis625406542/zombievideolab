"use client";

import { useState } from "react";

/** This reference clip is not an example of a paid, AI-generated result. */
export function TiptoeingReferenceVideo() {
  const [failed, setFailed] = useState(false);

  return <div className="demo-player tiptoe-reference">
    <div className="demo-format-strip" aria-label="Sample reference footage, 854 by 486 pixels, 15 seconds, landscape">
      <span className="demo-format-title"><span className="demo-status-dot"/> SAMPLE VIDEO</span>
      <div className="demo-format-tags"><span>854×486</span><span>15s</span><span>16:9</span></div>
    </div>
    <div className="demo-media">
      {failed ? <div className="tiptoe-reference-fallback" role="status">
        <img src="/tiptoeing-reference-poster.jpeg" alt="Still from the tiptoeing reference clip"/>
        <span>Reference video unavailable. Your generated result will appear here.</span>
      </div> : <video
        src="/tiptoeing-reference.mp4"
        poster="/tiptoeing-reference-poster.jpeg"
        controls autoPlay muted loop playsInline preload="metadata"
        aria-label="15-second trend reference clip; not an AI-generated example"
        onError={() => setFailed(true)}
      >Your browser does not support video playback.</video>}
    </div>
    <p className="tiptoe-reference-note">Trend reference only, not an AI-generated sample. Your paid video uses two adult portraits and targets 15 seconds.</p>
  </div>;
}
