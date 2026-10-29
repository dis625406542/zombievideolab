"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ImagePlus, Maximize2, Mic2, ShieldCheck, X } from "lucide-react";

type LocalPhoto = { file: File; url: string };

export function TinyStudio() {
  const [photo, setPhoto] = useState<LocalPhoto | null>(null);
  const [quality, setQuality] = useState<"480p" | "720p">("480p");
  const [consent, setConsent] = useState(false);
  const [tab, setTab] = useState<"preview" | "my-videos">("preview");
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  function choosePhoto(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage("Choose a JPG, PNG or WebP image under 10 MB.");
      return;
    }
    setPhoto({ file, url: URL.createObjectURL(file) });
    setMessage("");
  }

  return <div className="tiny-studio-grid" aria-label="Tiny Desk AI studio preview">
    <div className="tiny-studio-form">
      <div className="tiny-studio-heading"><h2>Make your Tiny Desk<br/>AI video</h2><span>AI CONCERT</span></div>
      <div className="tiny-field-heading"><span>1</span><strong>YOUR PHOTO</strong></div>
      <div className="tiny-photo-area"><label className={`tiny-upload ${photo ? "has-photo" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choosePhoto(event.dataTransfer.files[0]); }}>
        <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Add your photo" onChange={(event) => { choosePhoto(event.target.files?.[0]); event.target.value = ""; }} />
        {photo ? <><img src={photo.url} alt="Your chosen photo preview" /><span className="tiny-upload-replace">Change photo</span></> : <><span className="tiny-upload-plus"><ImagePlus size={23} strokeWidth={2} /></span><strong>Add photo</strong><small>One person, clearly visible</small></>}
      </label><div className="tiny-photo-slot"><div><Mic2 size={37} strokeWidth={1.4} /></div><span>Your spot<br/>on stage</span></div></div>
      {photo && <button type="button" className="tiny-clear-photo" onClick={() => setPhoto(null)}><X size={14} /> Remove {photo.file.name}</button>}
      <div className="tiny-photo-tip"><span>✧</span><p><strong>One clear portrait works best.</strong> Face the camera in good light. Adults only; use a photo you have permission to edit. JPG, PNG or WebP, up to 10 MB.</p></div>
      <div className="tiny-field-heading"><span>2</span><strong>QUALITY</strong></div>
      <fieldset className="tiny-quality"><legend className="sr-only">Video quality</legend><label className={quality === "480p" ? "selected" : ""}><input type="radio" name="quality" value="480p" checked={quality === "480p"} onChange={() => setQuality("480p")} /><strong>480p</strong><small>$5.99 · Standard</small></label><label className={quality === "720p" ? "selected" : ""}><input type="radio" name="quality" value="720p" checked={quality === "720p"} onChange={() => setQuality("720p")} /><strong>720p</strong><small>$8.99 · HD</small></label></fieldset>
      <label className="tiny-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>This is my photo or I have the person&apos;s permission to use it. Everyone shown is an adult.</span></label>
      <button type="button" className="tiny-generate" disabled>Generate video · Coming soon <ArrowRight size={18} /></button>
      {message && <p className="tiny-upload-error" role="alert">{message}</p>}
      <p className="tiny-studio-fine"><ShieldCheck size={15} /> Preview only. Your photo stays on this device. No upload, charge or generation occurs.</p>
    </div>
    <div className="tiny-studio-preview"><div className="tiny-preview-top"><div className="tiny-preview-tabs" role="tablist" aria-label="Video preview"><button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>The vibe</button><button type="button" role="tab" aria-selected={tab === "my-videos"} onClick={() => setTab("my-videos")}>My videos</button></div><span className="tiny-preview-badge"><Maximize2 size={14} /> 9:16 sample</span></div>
      <div className="tiny-preview-content" role="tabpanel">{tab === "preview" ? <><div className="tiny-sample-video"><video controls autoPlay muted loop playsInline preload="auto" poster="/tiny-band/sample-poster.webp" aria-label="Reference sample: five dogs performing at a desk-side concert"><source src="/api/tiny-desk/sample" type="video/mp4" />Your browser does not support video playback.</video><span>REFERENCE SAMPLE · NOT YOUR GENERATED VIDEO</span></div><p className="tiny-preview-caption">Watch the sample performance. Photo replacement and video generation are not available yet.</p></> : <div className="tiny-empty-videos"><span><Mic2 size={40} strokeWidth={1.2}/></span><h3>Your stage awaits</h3><p>Once video creation is available, your creations will appear here. There aren&apos;t any videos to show yet.</p><button type="button" onClick={() => setTab("preview")}>Back to concept preview <ArrowRight size={15} /></button></div>}</div>
    </div>
  </div>;
}
