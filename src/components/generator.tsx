"use client";

import { useEffect, useRef, useState } from "react";
import { DemoVideo } from "@/components/demo-video";
import { ArrowRight, Check, Copy, Download, ImagePlus, LockKeyhole, Play, RefreshCw, ShieldCheck, X } from "lucide-react";

type Role = "zombie" | "survivor";
type Photo = { file: File; url: string };
type Review = { status: "idle" | "checking" | "approved" | "rejected"; error?: string };
type State = "idle" | "working" | "ready" | "failed";
type Status = { status: string; progress: number; videoUrl?: string; error?: string };
type HistoryJob = Status & { code: string; resolution: string; createdAt: string };
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const SAVED_TASK = "zvl-last-video-task";
const SAVED_CODES = "zvl-video-codes";
const SAVED_CODE = "zvl-last-video-code";
function newVideoCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function UploadTile({ role, photo, review, onFile, onRemove }: {
  role: Role;
  photo: Photo | null;
  review: Review;
  onFile: (role: Role, file: File) => void;
  onRemove: (role: Role) => void;
}) {
  const name = role === "zombie" ? "The girlfriend" : "The boyfriend";
  const number = role === "zombie" ? "01" : "02";
  return (
    <div className={`upload-tile ${photo ? "has-photo" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) onFile(role, file); }}>
      <span className="upload-number">{number} / {name.toUpperCase()}</span>
      {photo ? <>
        <div className="upload-photo-frame"><img className="uploaded-thumb" src={photo.url} alt={`${name} portrait selected: ${photo.file.name}`} /></div>
        <span className="upload-file-name" title={photo.file.name}>{photo.file.name}</span>
        <span className={`photo-review ${review.status}`} aria-live="polite">{review.status === "checking" ? "AI checking…" : review.status === "approved" ? "✓ AI check passed" : review.status === "rejected" ? "✕ Choose another photo" : ""}</span>
        <button type="button" className="remove-photo" onClick={() => onRemove(role)} aria-label={`Remove ${name} portrait`}><X size={17} /></button>
      </> : <div className="upload-empty"><span className="upload-icon"><ImagePlus size={22} strokeWidth={1.5} /></span><strong>Upload a photo</strong><span>Tap or drag an image here</span></div>}
      <label className={`upload-cover ${photo ? "replace-cover" : ""}`} htmlFor={`upload-${role}`} aria-label={`${photo ? "Replace" : "Upload"} ${name} portrait`}>
        <span className="sr-only">{photo ? "Replace" : "Upload"} {name} portrait</span>
      </label>
      <input id={`upload-${role}`} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" aria-label={`${name} photo, JPG PNG or WebP, maximum 10 MB`} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(role, file); event.target.value = ""; }} />
    </div>
  );
}


function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth && image.naturalHeight ? resolve(image) : reject(new Error("This image is damaged."));
    image.onerror = () => reject(new Error("Please use a valid JPG, PNG or WebP image."));
    image.src = url;
  });
}

export function Generator() {
  const [zombie, setZombie] = useState<Photo | null>(null);
  const [survivor, setSurvivor] = useState<Photo | null>(null);
  const [consent, setConsent] = useState(false);
  const [reviews, setReviews] = useState<Record<Role, Review>>({ zombie: { status: "idle" }, survivor: { status: "idle" } });
  const [videoCode, setVideoCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [resolution, setResolution] = useState<"480p" | "720p">("480p");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [stage, setStage] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [history, setHistory] = useState<HistoryJob[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const [checkoutStep, setCheckoutStep] = useState<"closed" | "price" | "checkout">("closed");
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const versions = useRef({ zombie: 0, survivor: 0 });
  const poller = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<string | null>(null);
  const submitting = useRef(false);

  async function refreshHistory() {
    try {
      const response = await fetch("/api/video", { cache: "no-store" });
      const data = await response.json() as { enabled?: boolean; jobs?: HistoryJob[]; error?: string };
      if (!response.ok) throw new Error(data.error || "History is unavailable.");
      setAvailable(data.enabled === true);
      const jobs = data.jobs ?? [];
      setHistory(jobs);
      setHistoryError("");
      // Cache only codes for UI recovery. The server cookie determines ownership.
      try { localStorage.setItem(SAVED_CODES, JSON.stringify(jobs.map(job => job.code))); } catch { /* storage disabled */ }
      return jobs;
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "History is unavailable.");
      return [];
    }
  }

  useEffect(() => {
    const cachedCodes = (() => { try { return JSON.parse(localStorage.getItem(SAVED_CODES) || "[]") as string[]; } catch { return []; } })();
    const savedCode = sessionStorage.getItem(SAVED_CODE) ?? cachedCodes[0];
    setVideoCode(newVideoCode());
    let alive = true;
    void refreshHistory().then(jobs => {
      if (!alive) return;
      const selected = jobs.find(job => job.code === savedCode) ?? jobs[0];
      if (selected) {
        setSelectedCode(selected.code);
        if (selected.status === "finished" && selected.videoUrl) { setVideoUrl(selected.videoUrl); setStage("ready"); }
        if (selected.status === "running" || selected.status === "submitting") {
          handleRef.current = selected.code;
          setStage("working");
          void checkTask(selected.code);
        }
      }
    });
    return () => { alive = false; if (poller.current) clearTimeout(poller.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const timer = setInterval(async () => {
      const jobs = await refreshHistory();
      for (const job of jobs.filter(item => item.status === "running").slice(0, 8)) {
        try { await fetch(`/api/video?code=${job.code}`, { cache: "no-store" }); } catch { /* try again next interval */ }
      }
      if (jobs.some(item => item.status === "running")) void refreshHistory();
    }, 9000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => { if (zombie) URL.revokeObjectURL(zombie.url); }, [zombie]);
  useEffect(() => () => { if (survivor) URL.revokeObjectURL(survivor.url); }, [survivor]);
  useEffect(() => {
    if (stage !== "working") return;
    // This is an estimate while the provider is working, never an asserted provider percentage.
    const timer = setInterval(() => setVisualProgress(value => Math.min(94, Math.max(value + (value < 50 ? 2 : 0.5), progress))), 1100);
    return () => clearInterval(timer);
  }, [stage, progress]);

  async function checkTask(code: string) {
    if (handleRef.current !== code) return;
    try {
      const response = await fetch(`/api/video?code=${encodeURIComponent(code)}`, { cache: "no-store" });
      const data = await response.json() as Status & { error?: string };
      if (handleRef.current !== code) return;
      if (!response.ok) throw new Error(data.error || "Could not check the video task.");
      if (data.status === "finished" && data.videoUrl) {
        setVideoUrl(data.videoUrl); setStage("ready"); setProgress(100); setVisualProgress(100);
        setMessage("Your video is ready. Find it in this browser after refresh, and download it within three days.");
        void refreshHistory();
      } else if (data.status === "failed") {
        setStage("failed"); setMessage(`The model could not finish this video: ${data.error || "Provider error."} No new request has been submitted automatically.`);
        sessionStorage.removeItem(SAVED_TASK);
        void refreshHistory();
      } else {
        setProgress(data.progress || 0);
        setMessage(`Generating your video… ${data.progress || 0}% reported by the provider. This can take several minutes; keep this tab open or return later.`);
        poller.current = setTimeout(() => void checkTask(code), 6000);
      }
    } catch (error) {
      setMessage(`${error instanceof Error ? error.message : "Status unavailable."} Checking again shortly; a new video was not ordered.`);
      poller.current = setTimeout(() => void checkTask(code), 12000);
    }
  }

  async function selectPhoto(role: Role, file: File) {
    if (!ALLOWED.has(file.type)) { setMessage("Please choose a JPG, PNG or WebP photo; convert HEIC first."); return; }
    if (file.size > MAX_SIZE || !file.size) { setMessage("Each photo must be between 1 byte and 10 MB."); return; }
    const version = ++versions.current[role];
    setLoadingPhoto(true);
    const url = URL.createObjectURL(file);
    let previewSelected = false;
    try {
      await loadImage(url);
      if (version !== versions.current[role]) { URL.revokeObjectURL(url); return; }
      if (role === "zombie") setZombie({ file, url }); else setSurvivor({ file, url });
      previewSelected = true;
      setReviews(current => ({ ...current, [role]: { status: "checking" } }));
      setMessage("");
      const form = new FormData();
      form.append("photo", file);
      const response = await fetch("/api/video/moderate", { method: "POST", body: form });
      const data = await response.json() as { approved?: boolean; error?: string };
      if (version !== versions.current[role]) return;
      if (!response.ok || !data.approved) throw new Error(data.error || "The AI could not approve this photo.");
      setReviews(current => ({ ...current, [role]: { status: "approved" } }));
    } catch (error) {
      if (version === versions.current[role]) {
        const detail = error instanceof Error ? error.message : "Could not review photo.";
        setReviews(current => ({ ...current, [role]: { status: "rejected", error: detail } }));
        if (!previewSelected) URL.revokeObjectURL(url);
        setMessage(`${role === "zombie" ? "Photo 1" : "Photo 2"}: ${detail}`);
      }
      // The preview remains visible so the user can identify and replace the rejected image.
    } finally { if (version === versions.current[role]) setLoadingPhoto(false); }
  }
  function removePhoto(role: Role) {
    versions.current[role]++;
    if (role === "zombie") setZombie(null); else setSurvivor(null);
    setReviews(current => ({ ...current, [role]: { status: "idle" } }));
    setMessage("");
  }
  function regenerateCode() {
    if (submitting.current) return;
    if (poller.current) clearTimeout(poller.current);
    const next = newVideoCode();
    setVideoCode(next);
    setCodeCopied(false);
    handleRef.current = null;
    sessionStorage.removeItem(SAVED_TASK);
    sessionStorage.removeItem(SAVED_CODE);
    setVideoUrl(null); setSelectedCode(null);
    setStage("idle");
    setProgress(0); setVisualProgress(0);
    setMessage("New video code ready. Your photos are still selected.");
  }

  function openCheckout() {
    if (!available) { setMessage("Real generation is currently limited to private local testing."); return; }
    if (!zombie || !survivor) { setMessage("Add both adult portraits first."); return; }
    if (!consent) { setMessage("Confirm you have permission to use both photos first."); return; }
    if (reviews.zombie.status !== "approved" || reviews.survivor.status !== "approved") { setMessage("Wait until both photos pass the AI safety check. Replace any rejected photo before generating."); return; }
    if (submitting.current) return;
    if (!/^[A-F0-9]{32}$/.test(videoCode)) { setMessage("Wait for your video code to be ready."); return; }
    setMessage(""); setCheckoutStep("price");
  }

  async function generate() {
    if (submitting.current) return;
    setCheckoutStep("closed");
    if (!available) { setMessage("Real generation is currently limited to private local testing."); return; }
    if (!zombie || !survivor) { setMessage("Add both adult portraits first."); return; }
    if (!consent) { setMessage("Confirm you have permission to use both photos first."); return; }
    if (reviews.zombie.status !== "approved" || reviews.survivor.status !== "approved") { setMessage("Both photos must pass the AI safety check before generation."); return; }
    if (!/^[A-F0-9]{32}$/.test(videoCode)) { setMessage("Wait for your video code to be ready."); return; }
    submitting.current = true;
    const form = new FormData();
    form.append("zombie", zombie.file); form.append("survivor", survivor.file);
    form.append("resolution", resolution); form.append("aspectRatio", aspectRatio); form.append("consent", "yes"); form.append("code", videoCode);
    if (poller.current) clearTimeout(poller.current);
    handleRef.current = videoCode; setSelectedCode(videoCode); setStage("working"); setVideoUrl(null); setProgress(0); setVisualProgress(3);
    setMessage("Submitting your checked photos. The server rechecks both images before requesting a video…");
    try {
      const response = await fetch("/api/video", { method: "POST", body: form });
      const data = await response.json() as { code?: string; error?: string };
      if (!response.ok || !data.code) throw new Error(data.error || "Could not submit a video task.");
      handleRef.current = data.code;
      sessionStorage.setItem(SAVED_TASK, data.code);
      sessionStorage.setItem(SAVED_CODE, videoCode);
      setMessage("Request accepted. Generating your AI video…");
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      void refreshHistory();
      void checkTask(data.code);
    } catch (error) {
      setStage("failed"); setVisualProgress(0); setMessage(error instanceof Error ? error.message : "Unable to generate this video.");
    } finally { submitting.current = false; void refreshHistory(); }
  }

  return (
    <div id="generator" tabIndex={-1} className="generator" aria-label="Zombie couple video generator">
      <div className="form-panel">
        <div className="panel-heading"><div><span className="panel-overline"><span className="live-dot"/> THE STORY BEGINS HERE</span><h2>Make your moment <em>unforgettable.</em></h2><p>Two adult portraits. One fictional zombie love video. No account needed.</p></div><span className="panel-index">01—02</span></div>
        <div className="tool-label"><span>YOUR CHARACTERS</span><span>JPG, PNG OR WEBP · MAX 10 MB EACH</span></div>
        <div className="upload-grid"><UploadTile role="zombie" photo={zombie} review={reviews.zombie} onFile={selectPhoto} onRemove={removePhoto}/><UploadTile role="survivor" photo={survivor} review={reviews.survivor} onFile={selectPhoto} onRemove={removePhoto}/></div>
        <p className="upload-hint">Each photo is sent for AI safety screening as soon as you select it; replace any photo that fails before generating. The server checks both again before sending approved photos to the video provider. Use consenting adult portraits only; AI cannot verify age or consent with certainty.</p>
        {(reviews.zombie.status !== "idle" || reviews.survivor.status !== "idle") && <div className="review-summary" role="status" aria-live="polite">{(["zombie", "survivor"] as const).map((role, index) => <p key={role}><strong>Photo {index + 1}:</strong> {reviews[role].status === "checking" ? "Checking with AI…" : reviews[role].status === "approved" ? "Passed AI safety check" : reviews[role].status === "rejected" ? reviews[role].error : "Not selected"}</p>)}</div>}
        <fieldset className="resolution-field"><legend>Video quality</legend><div className="resolution-options">{(["480p", "720p"] as const).map(value => <label key={value} className={resolution === value ? "selected" : ""}><input type="radio" name="resolution" value={value} checked={resolution === value} onChange={() => setResolution(value)} disabled={submitting.current}/>{value}</label>)}</div><small>8 seconds · 720p may take more time and provider credits.</small></fieldset>
        <fieldset className="resolution-field"><legend>Video format</legend><div className="resolution-options">{(["9:16", "16:9"] as const).map(value => <label key={value} className={aspectRatio === value ? "selected" : ""}><input type="radio" name="aspectRatio" value={value} checked={aspectRatio === value} onChange={() => setAspectRatio(value)} disabled={submitting.current}/>{value === "9:16" ? "9:16 Portrait" : "16:9 Landscape"}</label>)}</div><small>Choose portrait for mobile or landscape for widescreen playback.</small></fieldset>
        <label className="consent-row"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span className="custom-check" aria-hidden="true"><Check size={12}/></span><span>I am at least 18; both people are adults who consented to this fictional AI video. I have rights to upload these photos to the provider, and my submission follows the Acceptable Use Policy.</span></label>
        <div className="action-area"><button type="button" className="primary-button" onClick={openCheckout} disabled={stage === "working" || loadingPhoto || reviews.zombie.status === "checking" || reviews.survivor.status === "checking" || !available}>{stage === "working" ? "Generating your video…" : available ? "Generate AI video" : "Private testing only"} {stage !== "working" && <ArrowRight size={19}/>}</button><p className="price-note"><LockKeyhole size={14}/> Demo checkout · No real charge · Provider credits are used</p></div>
        <p className="form-message" role="status" aria-live="polite">{message}</p>
        <p className="tool-legal">Selecting a photo sends a resized copy to our AI safety service. Originals go to the video provider only after you confirm generation and the server rechecks both photos. When your video is ready, you can return to this browser to play or download it for up to three days after storage. <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/acceptable-use">Prohibited content</a></p>
        <div className="form-footer"><span><ShieldCheck size={16}/> Use only authorized adult photos</span><span>VIDEO GENERATION <span aria-hidden="true">↗</span></span></div>
      </div>
      {checkoutStep !== "closed" && <div className="checkout-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCheckoutStep("closed"); }}>
        <div className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onKeyDown={event => { if (event.key === "Escape") setCheckoutStep("closed"); }}>
          <button type="button" className="checkout-close" onClick={() => setCheckoutStep("closed")} aria-label="Close checkout"><X size={19}/></button>
          <span className="checkout-eyebrow">ZOMBIE VIDEO LAB · LOCAL DEMO</span>
          <h2 id="checkout-title">{checkoutStep === "price" ? "Your story, one video." : "Your Video Code"}</h2>
          <p>{checkoutStep === "price" ? "One 8-second zombie love story using your two approved portraits. No subscription or credits to manage." : "Your photos passed the initial AI check. After the demo checkout, the server rechecks them before submitting to the video provider. A successful request uses provider credits."}</p>
          <div className="checkout-summary"><span>One-time video · {resolution} · {aspectRatio} · 8s</span><strong>$9.90</strong></div>
          <div className="checkout-code-label">Your video code</div>
          <div className="video-code-row"><output className="video-code-value" aria-label="Video code to keep">{videoCode}</output><button type="button" className="video-code-action" onClick={() => { void navigator.clipboard.writeText(videoCode).then(() => setCodeCopied(true)).catch(() => setMessage("Select the code to copy it.")); }}><Copy size={16}/> Copy</button><a className="video-code-action" href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Zombie Video Lab video code: ${videoCode}\nKeep this browser cookie; this code alone does not grant access on other devices.\n`)}`} download={`zombie-video-code-${videoCode}.txt`} aria-label="Download video code as a text file"><Download size={16}/> Save code</a><button type="button" className="video-code-action" onClick={regenerateCode} aria-label="Generate another video code"><RefreshCw size={16}/> New</button></div>
          {codeCopied && <span className="code-copied" role="status">Code copied</span>}
          <p className="checkout-retention">Your video will remain available in this browser after a refresh for up to 3 days after it is ready. <strong>Download it within 3 days.</strong> Keep this browser’s cookies; clearing them or switching devices may remove access. Your video code alone cannot recover the video on another device.</p>
          <p className="checkout-disclaimer">Illustrative price only · No real payment is taken · Not a purchase receipt.</p>
          <button type="button" className="checkout-primary" onClick={() => checkoutStep === "price" ? setCheckoutStep("checkout") : void generate()}>{checkoutStep === "price" ? "Continue to demo checkout" : "Simulate payment & generate"} <ArrowRight size={18}/></button>
          <button type="button" className="checkout-secondary" onClick={() => setCheckoutStep("closed")}>Not now</button>
        </div>
      </div>}
      <div className="preview-panel" ref={previewRef} aria-label="Video preview" aria-busy={stage === "working"}>
        <div className="preview-header"><span>THE NIGHTFALL STORY <span className="preview-line">/</span> LOOK 01</span><span className="preview-diamond">✧</span></div>
        <div className="visual-window video-window">{videoUrl ? <video src={videoUrl} controls playsInline preload="metadata" aria-label="Your generated zombie couple video"/> : <DemoVideo />}</div>
        {stage === "working" && <div className="generation-progress" role="progressbar" aria-label="Estimated video generation progress" aria-valuenow={Math.round(visualProgress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="generation-progress-text"><span>CREATING YOUR STORY</span><strong>{Math.round(visualProgress)}% <small>estimated</small></strong></div>
          <div className="generation-track"><span style={{ width: `${visualProgress}%` }}/></div>
          <p>AI rendering may take several minutes. Actual provider progress: {progress}%. You may refresh or return to this browser later.</p>
        </div>}
        <div className="preview-footer"><div><span className="preview-footer-icon"><Play size={15} fill="currentColor"/></span><div><strong>{stage === "ready" ? "Your AI video is ready" : stage === "working" ? "Generating your story" : "Preview your zombie love story"}</strong><span>{stage === "ready" ? "Watch and download within three days after storage" : stage === "working" ? "You can return to this tab to check progress" : "Your finished video will replace this sample preview"}</span></div></div>{videoUrl ? <a className="preview-download" href={selectedCode ? `/api/video/file?code=${encodeURIComponent(selectedCode)}&download=1` : videoUrl} target="_blank" rel="noopener noreferrer" download aria-label="Open generated video to save"><Download size={18}/></a> : <span className="preview-badge">PREVIEW</span>}</div>
        {videoUrl && <p className="export-help">On mobile, open the video link above and use your browser&apos;s Save or Share menu. Your download is available in this browser for up to three days after storage; keep this browser cookie.</p>}
        <section className="video-history" aria-label="Your video history">
          <div className="history-heading"><div><span>YOUR PRIVATE COLLECTION</span><h3>Your videos</h3></div><button type="button" onClick={() => void refreshHistory()} aria-label="Refresh video history"><RefreshCw size={17}/></button></div>
          <p className="history-help">This browser remembers your videos without an account. Save finished videos within three days after storage. Clearing your cookies may prevent recovery.</p>
          {historyError && <p role="alert" className="history-error">{historyError}</p>}
          {history.length === 0 ? <p className="history-empty">Your creations will appear here after you generate your first video.</p> :
            <div className="history-grid">{history.map((job, index) => <article key={job.code} className={`history-card ${selectedCode === job.code ? "active" : ""}`}>
              <button type="button" className="history-preview" onClick={() => {
                if (poller.current) clearTimeout(poller.current);
                handleRef.current = job.status === "running" ? job.code : null;
                setSelectedCode(job.code);
                sessionStorage.setItem(SAVED_CODE, job.code);
                setVideoUrl(job.videoUrl ?? null);
                setProgress(job.progress);
                setVisualProgress(job.progress);
                setStage(job.status === "finished" && job.videoUrl ? "ready" : job.status === "running" ? "working" : "failed");
                if (job.status === "running") void checkTask(job.code);
                previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }} aria-label={`Show video ${job.code} in the main player`}>
                {job.status === "finished" && job.videoUrl ? <video src={job.videoUrl} muted playsInline preload={index < 6 ? "metadata" : "none"} /> : <span className="history-placeholder"><Play size={21}/></span>}
                <span className="history-state">{job.status === "finished" ? "READY" : job.status === "running" ? `GENERATING ${job.progress}%` : job.status === "submitting" ? "SUBMITTING" : job.status === "unknown" ? "CHECK SUPPORT" : "FAILED"}</span>
              </button>
              <div className="history-meta"><span>{new Date(job.createdAt).toLocaleDateString()} · {job.resolution}</span><code title={job.code}>{job.code.slice(0, 8)}…</code></div>
              {job.status === "finished" && job.videoUrl && <a href={`/api/video/file?code=${encodeURIComponent(job.code)}&download=1`} target="_blank" rel="noopener noreferrer" className="history-download" aria-label={`Open video ${job.code} to download`}><Download size={15}/> Download / Save</a>}
              {job.error && <p className="history-error">{job.error}</p>}
            </article>)}</div>}
        </section>
      </div>
    </div>
  );
}
