"use client";

import { useCallback, useRef, useState } from "react";

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

type PreviewId = keyof typeof previews;
const playlist: readonly PreviewId[] = ["reference", "result"];
const previewNames: Record<PreviewId, string> = { reference: "Reference", result: "Real result" };

/** Public samples cycle in order; private order playback is managed separately. */
export function TiptoeingExampleVideo() {
  const [selected, setSelected] = useState<PreviewId>("reference");
  const [restart, setRestart] = useState(0);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const volume = useRef(1);
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (video) video.volume = volume.current;
  }, []);
  const preview = previews[selected];
  const selectedIndex = playlist.indexOf(selected);

  function playPreview(id: PreviewId) {
    setSelected(id);
    // Remount even when reselecting the active sample: always restart at zero.
    setRestart(value => value + 1);
    setFailed(false);
  }

  return <div className="demo-player tiptoe-reference">
    <div className="demo-format-strip tiptoe-preview-toolbar">
      <div className="tiptoe-preview-switch" role="group" aria-label="Choose a public video preview">
        {playlist.map(id => <button key={id} type="button" aria-pressed={selected === id}
          onClick={() => playPreview(id)}>{previewNames[id]}</button>)}
      </div>
      <div className="demo-format-tags" aria-label="Preview video format">{preview.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    </div>
    <div className="demo-media">
      {failed ? <div className="tiptoe-reference-fallback" role="status">
        <img src={preview.poster} alt={`Still from ${preview.label}`}/>
        <span>Preview playback is unavailable. Select a preview to try again.</span>
      </div> : <video key={`${selected}-${restart}`} ref={attachVideo} src={preview.src} poster={preview.poster}
        width={preview.width} height={preview.height} controls autoPlay muted={muted} playsInline preload="metadata"
        aria-label={preview.label} onError={() => setFailed(true)}
        onVolumeChange={event => {
          volume.current = event.currentTarget.volume;
          setMuted(event.currentTarget.muted);
        }}
        onEnded={() => playPreview(playlist[(selectedIndex + 1) % playlist.length])}
      >Your browser does not support video playback.</video>}
    </div>
    <p className="tiptoe-reference-note">{preview.note}</p>
  </div>;
}
