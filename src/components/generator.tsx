"use client";

import { DEFAULT_TEMPLATE, videoTemplate, type SceneId, type TemplateId } from "@/lib/video-templates";
import { useEffect, useRef, useState } from "react";
import { DemoVideo } from "@/components/demo-video";
import { TiptoeingExampleVideo } from "@/components/tiptoeing-example-video";
import { GeneratedVideo } from "@/components/generated-video";
import { ArrowRight, Check, Copy, Download, ImagePlus, LockKeyhole, Play, RefreshCw, ShieldCheck, X } from "lucide-react";

type Role = "zombie" | "survivor";
type Photo = { file: File; url: string };
type Review = { status: "idle" | "checking" | "approved" | "rejected"; error?: string };
type State = "idle" | "working" | "ready" | "failed";
type Status = { status: string; progress: number; videoUrl?: string; error?: string; resolution?: string; aspectRatio?: string; durationSeconds?: number };
type Price = { resolution: "480p" | "720p"; amount_minor: number; currency: string; name: string; purchasable: boolean };
type Purchase = { sceneId?: SceneId; code: string; status: string; generationStatus: string; resolution: string; aspectRatio: string; amountMinor: number; currency: string; canRetry: boolean; error?: string };
const money = (amount: number, currency = "USD") => new Intl.NumberFormat("en-US", {style:"currency",currency}).format(amount / 100);
type HistoryJob = Status & { code: string; resolution: string; aspectRatio: string; durationSeconds: number; createdAt: string };
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function newVideoCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function UploadTile({ role, label, description, photo, review, onFile, onRemove }: {
  role: Role;
  label: string;
  description?: string;
  photo: Photo | null;
  review: Review;
  onFile: (role: Role, file: File) => void;
  onRemove: (role: Role) => void;
}) {
  const name = label;
  const number = role === "zombie" ? "01" : "02";
  const descriptionId = description ? `upload-${role}-description` : undefined;
  const tile = (
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
      <input id={`upload-${role}`} aria-describedby={descriptionId} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" aria-label={`${name} photo, JPG PNG or WebP, maximum 10 MB`} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(role, file); event.target.value = ""; }} />
    </div>
  );
  return description ? <div className="upload-role-card">{tile}<p id={descriptionId} className="upload-role-description"><strong>Photo {Number(number)} · {name}</strong><span>{description}</span></p></div> : tile;
}


function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth && image.naturalHeight ? resolve(image) : reject(new Error("This image is damaged."));
    image.onerror = () => reject(new Error("Please use a valid JPG, PNG or WebP image."));
    image.src = url;
  });
}

async function optimizePhoto(file: File, source: string): Promise<File> {
  const image = await loadImage(source);
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this photo.");
  context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.88, 0.76, 0.6, 0.45]) {
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= 1700000) return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {type:"image/jpeg"});
  }
  throw new Error("This photo is too large after optimization. Please choose a smaller image.");
}

export function Generator({ templateId = DEFAULT_TEMPLATE, initialPrices = [] }: { templateId?: TemplateId; initialPrices?: Price[] }) {
  const template = videoTemplate(templateId);
  const [sceneId, setSceneId] = useState<SceneId>(templateId === "tiptoeing-in-my-jordans" ? "dancer-only" : "two-person");
  const dancerOnly = templateId === "tiptoeing-in-my-jordans" && sceneId === "dancer-only";
  const activeRoles: Role[] = dancerOnly ? ["zombie"] : ["zombie", "survivor"];
  const suffix = templateId === DEFAULT_TEMPLATE ? "" : `:${templateId}`;
  const SAVED_TASK = `zvl-last-video-task${suffix}`;
  const SAVED_CODES = `zvl-video-codes${suffix}`;
  const SAVED_CODE = `zvl-last-video-code${suffix}`;
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
  const [playingFormat, setPlayingFormat] = useState<{ resolution: string; aspectRatio: string; durationSeconds: number } | null>(null);
  const [available, setAvailable] = useState(false);
  const [prices, setPrices] = useState<Price[]>(initialPrices);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingFailed, setBillingFailed] = useState(false);
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [mockPayment, setMockPayment] = useState(false);
  const [busy, setBusy] = useState(false);
  const bootstrap = useRef<Promise<unknown> | null>(null);
  const selectedPrice = prices.find(price => price.resolution === resolution);
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
  const syncState = useRef<{ orders: Purchase[]; jobs: HistoryJob[] }>({ orders: [], jobs: [] });

  async function refreshHistory() {
    try {
      const response = await fetch(`/api/video?template=${templateId}`, { cache: "no-store" });
      const data = await response.json() as { enabled?: boolean; jobs?: HistoryJob[]; error?: string };
      if (!response.ok) throw new Error(data.error || "History is unavailable.");

      const jobs = data.jobs ?? [];
      syncState.current.jobs = jobs;
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

  async function refreshBilling(code?: string): Promise<Purchase[]> {
    try {
      const response = await fetch(`/api/billing?template=${templateId}${code ? `&code=${encodeURIComponent(code)}` : ""}`, {cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment information is unavailable. Do not pay again.");
      if (data.order) {
        syncState.current.orders = [data.order, ...syncState.current.orders.filter(order => order.code !== data.order.code)];
        setOrders(syncState.current.orders);
        return [data.order];
      }
      syncState.current.orders = data.orders ?? [];
      const nextPrices: Price[] = data.prices ?? [];
      setPrices(nextPrices); setOrders(syncState.current.orders);
      setResolution(current => nextPrices.some(price => price.resolution === current && price.purchasable)
        ? current : nextPrices.find(price => price.purchasable)?.resolution ?? current);
      setAvailable(data.enabled === true); setTestMode(data.testMode === true); setMockPayment(data.mockPayment === true);
      if (!code) { setBillingFailed(false); setBillingLoading(false); }
      return data.orders ?? [];
    } catch (error) {
      if (!code) { setAvailable(false); setBillingFailed(true); }
      throw error;
    } finally {
      if (!code) setBillingLoading(false);
    }
  }

  async function continueOrder(order: Purchase, retry = false) {
    if (submitting.current) return;
    submitting.current = true; setBusy(true);
    handleRef.current = order.code; setSelectedCode(order.code); setVideoUrl(null);
    setStage("working"); setVisualProgress(3);
    setMessage(retry ? "Retrying your paid order. No new payment is required." : "Payment verified. Preparing your video…");
    try {
      const response = await fetch("/api/video", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:order.code,retry,template:templateId})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your purchase is saved. Please check again; do not pay again.");
      sessionStorage.setItem(SAVED_CODE, order.code);
      await refreshHistory(); await refreshBilling();
      void checkTask(order.code);
    } catch (error) { setStage("failed"); setMessage(error instanceof Error ? error.message : "Your paid order is saved. Do not pay again."); }
    finally { submitting.current = false; setBusy(false); }
  }
  useEffect(() => {
    let alive = true;
    setVideoCode(newVideoCode());
    bootstrap.current = (async () => {
      try {
        // Initialize one signed cookie before requesting history or uploading photos.
        await refreshBilling();
        const params = new URLSearchParams(window.location.search);
        const returnedCode = params.get("code");
        if (returnedCode && /^[A-F0-9]{32}$/.test(returnedCode)) {
          const [order] = await refreshBilling(returnedCode);
          if (!alive) return;
          setSelectedCode(returnedCode);
          sessionStorage.setItem(SAVED_CODE, returnedCode);
          if (order.status === "paid" && order.generationStatus === "ready") void continueOrder(order);
          else if (order.status === "pending") setMessage(params.get("checkout") === "cancel" ? "Checkout was cancelled. Resume your existing order below; do not create a duplicate purchase." : "Checking your payment with Stripe. Please wait; do not pay again.");
          window.history.replaceState(null, "", `${template.path}#generator`);
        }
        const jobs = await refreshHistory();
        if (!alive || submitting.current) return;
        const saved = sessionStorage.getItem(SAVED_CODE);
        const selected = jobs.find(job => job.code === saved) ?? jobs[0];
        if (selected) {
          // Tiptoeing opens on its public sample, not a private historical result.
          if (selected.status === "finished" && selected.videoUrl && templateId === DEFAULT_TEMPLATE) {
            setSelectedCode(selected.code); setPlayingFormat(selected); setVideoUrl(selected.videoUrl); setStage("ready");
          }
          if (["running","submitting"].includes(selected.status)) {
            setSelectedCode(selected.code); handleRef.current = selected.code; setStage("working"); void checkTask(selected.code);
          }
        }
      } catch (error) { if (alive) setMessage(error instanceof Error ? error.message : "Could not load your orders."); }
    })();
    return () => { alive = false; if (poller.current) clearTimeout(poller.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let running = false;
    let disposed = false;
    let lastSync = 0;
    const activeGeneration = new Set(["ready", "preparing", "submitting", "running"]);
    async function sync(force = false) {
      if (disposed || running || document.visibilityState !== "visible") return;
      running = true;
      try {
        await bootstrap.current;
        if (disposed || document.visibilityState !== "visible") return;
        const { orders: purchases, jobs } = syncState.current;
        const hasWork = purchases.some(order => order.status === "pending" ||
          (order.status === "paid" && activeGeneration.has(order.generationStatus))) ||
          jobs.some(job => ["running", "submitting"].includes(job.status));
        // Idle/finished visitors do not need recurring database or Stripe checks.
        // Focus/visibility events still discover changes made in another tab.
        if ((!force && !hasWork) || Date.now() - lastSync < 3000) return;
        lastSync = Date.now();
        const updatedPurchases = await refreshBilling();
        if (disposed || document.visibilityState !== "visible") return;
        const pending = updatedPurchases.find(order => order.status === "pending");
        if (pending) {
          const [updated] = await refreshBilling(pending.code);
          if (disposed || document.visibilityState !== "visible") return;
          if (updated.status === "paid" && updated.generationStatus === "ready") void continueOrder(updated);
        }
        const updatedJobs = await refreshHistory();
        for (const job of updatedJobs.filter(item => ["running", "submitting"].includes(item.status)).slice(0, 3)) {
          if (disposed || document.visibilityState !== "visible") return;
          if (job.code !== handleRef.current) await fetch(`/api/video?template=${templateId}&code=${encodeURIComponent(job.code)}`, {cache:"no-store"});
        }
      } catch { /* Preserve history and retry on active work or tab return. Never infer payment from a redirect. */ }
      finally { running = false; }
    }
    const onResume = () => { void sync(true); };
    const timer = setInterval(() => { void sync(); }, 12000);
    document.addEventListener("visibilitychange", onResume);
    window.addEventListener("focus", onResume);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onResume);
      window.removeEventListener("focus", onResume);
    };
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
    if (document.visibilityState !== "visible") {
      poller.current = setTimeout(() => void checkTask(code), 6000);
      return;
    }
    try {
      const response = await fetch(`/api/video?template=${templateId}&code=${encodeURIComponent(code)}`, { cache: "no-store" });
      const data = await response.json() as Status & { error?: string };
      if (handleRef.current !== code) return;
      if (!response.ok) throw new Error(data.error || "Could not check the video task.");
      if (data.status === "finished" && data.videoUrl) {
        setSelectedCode(code);
        setPlayingFormat({ resolution: data.resolution ?? resolution, aspectRatio: data.aspectRatio ?? aspectRatio, durationSeconds: data.durationSeconds ?? template.durationSeconds });
        setVideoUrl(data.videoUrl); setStage("ready"); setProgress(100); setVisualProgress(100);
        setMessage("Your video is ready. Find it in this browser after refresh, and download it within three days.");
        void refreshHistory();
      } else if (data.status === "failed" || data.status === "unknown") {
        setStage("failed"); setMessage(`${data.status === "unknown" ? "Submission status is uncertain" : "Video generation failed"}: ${data.error || "Contact support with your video code."} No new request has been submitted automatically.`);
        sessionStorage.removeItem(SAVED_TASK);
        void refreshHistory(); void refreshBilling();
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
      file = await optimizePhoto(file, url);
      await bootstrap.current;
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
    if (!available || !selectedPrice?.purchasable) { setMessage("Secure checkout is not available yet. No payment has been taken."); return; }
    if (!zombie || (!dancerOnly && !survivor)) { setMessage(dancerOnly ? "Add the adult dancer portrait first." : "Add both adult portraits first."); return; }
    if (!consent) { setMessage("Confirm you have permission to use the uploaded photos first."); return; }
    if (activeRoles.some(role => reviews[role].status !== "approved")) { setMessage("Wait until your uploaded photos pass the AI safety check. Replace any rejected photo before generating."); return; }
    if (submitting.current) return;
    if (!/^[A-F0-9]{32}$/.test(videoCode)) { setMessage("Wait for your video code to be ready."); return; }
    setMessage(""); setCheckoutStep("price");
  }

  async function beginCheckout(existingCode?: string) {
    if (submitting.current) return;
    if (!existingCode && (!zombie || (!dancerOnly && !survivor) || !selectedPrice?.purchasable || !consent || activeRoles.some(role => reviews[role].status !== "approved"))) return;
    submitting.current = true; setBusy(true);
    setMessage(mockPayment ? "Preparing local simulated payment. Your photos are still checked…" : "Preparing secure checkout. Your photos are checked before payment…");
    try {
      const form = new FormData(); form.append("code", existingCode ?? videoCode); form.append("template", templateId);
      if (!existingCode && zombie) {
        form.append("scene", sceneId);
        form.append("zombie", zombie.file);
        if (!dancerOnly && survivor) form.append("survivor", survivor.file);
        form.append("resolution", resolution); form.append("aspectRatio", aspectRatio); form.append("consent", "yes");
      }
      const response = await fetch("/api/billing/checkout", {method:"POST",body:form});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not open secure checkout.");
      if (mockPayment && data.mockPayment === true && data.order?.status === "paid") {
        sessionStorage.setItem(SAVED_CODE, data.code);
        setCheckoutStep("closed");
        submitting.current = false;
        await continueOrder(data.order);
        return;
      }
      if (!data.checkoutUrl) throw new Error("Checkout did not return a valid payment result.");
      sessionStorage.setItem(SAVED_CODE, data.code);
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open checkout. Please check your orders.");
      setCheckoutStep("closed"); void refreshBilling().catch(()=>{});
    } finally { submitting.current = false; setBusy(false); }
  }

  return (
    <div id="generator" tabIndex={-1} className="generator" aria-label={template.title}>
      <div className="form-panel">
        <div className="panel-heading"><div><span className="panel-overline"><span className="live-dot"/> {template.overline}</span><h2>{template.heading} <em>{template.emphasis}</em></h2><p>{template.intro}</p></div><span className="panel-index">01—02</span></div>
        {templateId === "tiptoeing-in-my-jordans" && <div className="template-duration-card" aria-label="Video duration: 15 seconds">
          <span className="template-duration-value">{template.durationSeconds}<span>s</span></span>
          <div><strong>{template.durationSeconds}-second AI video</strong><p>Fixed duration for both 480p and 720p. Choose your quality below.</p></div>
        </div>}
        {templateId === "tiptoeing-in-my-jordans" && <fieldset className="scene-picker" disabled={busy || stage === "working" || checkoutStep !== "closed"}>
          <legend>Choose your cast</legend>
          <div className="scene-options">{([
            {id: "dancer-only", title: "Dancer only", detail: "1 photo · Keep the reference observer"},
            {id: "two-person", title: "Two people", detail: "2 photos · Choose both characters"},
          ] as const).map(mode => <label key={mode.id} className={sceneId === mode.id ? "selected" : ""}>
            <input type="radio" name="scene" value={mode.id} checked={sceneId === mode.id} onChange={() => {
              setSceneId(mode.id); setConsent(false); regenerateCode();
              setMessage(mode.id === "dancer-only" ? "Upload only the dancer. The reference video supplies the seated observer." : "Upload the dancer first and the seated observer second.");
            }}/><span><strong>{mode.title}</strong><small>{mode.detail}</small></span>
          </label>)}</div>
        </fieldset>}
        <div className="tool-label"><span>YOUR CHARACTERS</span><span>JPG, PNG OR WEBP · MAX 10 MB EACH</span></div>
        <div className={`upload-grid${dancerOnly ? " single-cast" : ""}`}><UploadTile label={template.roles[0]} description={template.roleDescriptions?.[0]} role="zombie" photo={zombie} review={reviews.zombie} onFile={selectPhoto} onRemove={removePhoto}/>{dancerOnly ? <div className="reference-observer-card"><span className="reference-observer-icon" aria-hidden="true"><Play size={24}/></span><strong>Observer from the reference</strong><p>No second photo needed. We ask the AI to preserve the seated observer’s appearance and clothing from the reference video.</p><small>Two characters still appear. AI recreation may vary.</small></div> : <UploadTile label={template.roles[1]} description={template.roleDescriptions?.[1]} role="survivor" photo={survivor} review={reviews.survivor} onFile={selectPhoto} onRemove={removePhoto}/>}</div>
        <p className="upload-hint"><strong>{dancerOnly ? "Photo 1: dancer. Only the dancer is replaced; the seated observer comes from the reference video." : template.instructions}</strong> Each photo is sent for AI safety screening as soon as you select it; replace any photo that fails before generating. The server checks uploaded photos again before sending approved photos to the video provider. Use consenting adult portraits only; AI cannot verify age or consent with certainty.</p>
        {(reviews.zombie.status !== "idle" || reviews.survivor.status !== "idle") && <div className="review-summary" role="status" aria-live="polite">{activeRoles.map((role, index) => <p key={role}><strong>Photo {index + 1}:</strong> {reviews[role].status === "checking" ? "Checking with AI…" : reviews[role].status === "approved" ? "Passed AI safety check" : reviews[role].status === "rejected" ? reviews[role].error : "Not selected"}</p>)}</div>}
        <fieldset className="resolution-field"><legend>Video quality{templateId === "tiptoeing-in-my-jordans" ? ` · ${template.durationSeconds}s video` : ""}</legend><div className="resolution-options">{(["480p", "720p"] as const).map(value => <label key={value} className={resolution === value ? "selected" : ""}><input type="radio" name="resolution" value={value} checked={resolution === value} onChange={() => setResolution(value)} disabled={busy || !prices.some(price => price.resolution === value && price.purchasable)}/>{value}{templateId === "tiptoeing-in-my-jordans" ? ` · ${template.durationSeconds}s` : ""} {prices.find(price => price.resolution === value) ? money(prices.find(price => price.resolution === value)!.amount_minor) : ""}</label>)}</div><small>{template.durationSeconds} seconds · One video per purchase · No subscription.</small></fieldset>
        <fieldset className="resolution-field"><legend>Video format</legend><div className="resolution-options format-options">{(["9:16", "16:9"] as const).map(value => <label key={value} className={aspectRatio === value ? "selected" : ""}>
          <input type="radio" name="aspectRatio" value={value} aria-label={value === "9:16" ? "9:16 portrait video" : "16:9 landscape video"} checked={aspectRatio === value} onChange={() => setAspectRatio(value)} disabled={busy}/>
          <svg className="format-icon" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><rect x={value === "9:16" ? 9 : 2} y={value === "9:16" ? 2 : 9} width={value === "9:16" ? 18 : 32} height={value === "9:16" ? 32 : 18} rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
          <span className="format-ratio">{value}</span>
        </label>)}</div></fieldset>
        <label className="consent-row"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span className="custom-check" aria-hidden="true"><Check size={12}/></span><span>{dancerOnly ? "I am at least 18. The uploaded dancer is an adult who consented to this fictional AI video. I have rights to upload this photo to the provider, and my submission follows the Acceptable Use Policy." : "I am at least 18; both people are adults who consented to this fictional AI video. I have rights to upload these photos to the provider, and my submission follows the Acceptable Use Policy."}</span></label>
        <div className="action-area"><button type="button" className="primary-button" onClick={openCheckout} disabled={busy || stage === "working" || loadingPhoto || activeRoles.some(role => reviews[role].status === "checking") || !available || !selectedPrice?.purchasable}>{stage === "working" ? "Generating your video…" : busy ? "Opening checkout…" : billingLoading ? "Checking checkout…" : billingFailed ? "Checkout check failed" : available ? (templateId === "tiptoeing-in-my-jordans" ? `Generate ${template.durationSeconds}s AI video` : "Generate AI video") : "Checkout unavailable"} {stage !== "working" && <ArrowRight size={19}/>}</button><p className="price-note"><LockKeyhole size={14}/> {selectedPrice ? `${money(selectedPrice.amount_minor, selectedPrice.currency)} · One-time payment · No subscription` : billingLoading ? "Loading prices…" : "Prices could not be loaded. Please retry."}</p></div>
        {billingFailed && <p className="price-note" role="status">We could not verify checkout. <button type="button" className="billing-retry" onClick={() => { setBillingLoading(true); setBillingFailed(false); void refreshBilling().catch(() => setMessage("Checkout could not be verified. Please try again later; do not pay twice.")); }}>Retry checkout check</button></p>}
        {templateId === "tiptoeing-in-my-jordans" && <p className="price-note">15-second MP4 · AI-created background music requested · Download within 3 days.</p>}
        {!billingLoading && !billingFailed && !available && prices.length > 0 && <p className="history-help">Checkout for this template is not available yet. No payment can be taken.</p>}
        <p className="form-message" role="status" aria-live="polite">{message}</p>
        <p className="tool-legal">Selecting a photo sends a resized copy to our AI safety service. Optimized photos are temporarily stored privately for checkout and paid retries, then sent to the video provider only after payment verification and another safety check. When your video is ready, you can return to this browser to play or download it for up to three days after generation. <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/acceptable-use">Prohibited content</a></p>
        <div className="form-footer"><span><ShieldCheck size={16}/> Use only authorized adult photos</span><span>VIDEO GENERATION <span aria-hidden="true">↗</span></span></div>
      </div>
      {checkoutStep !== "closed" && <div className="checkout-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCheckoutStep("closed"); }}>
        <div className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onKeyDown={event => { if (event.key === "Escape") setCheckoutStep("closed"); }}>
          <button type="button" className="checkout-close" onClick={() => setCheckoutStep("closed")} aria-label="Close checkout"><X size={19}/></button>
          <span className="checkout-eyebrow">ZOMBIE VIDEO LAB · {mockPayment ? "LOCAL TEST CHECKOUT" : "SECURE CHECKOUT"}</span>
          <h2 id="checkout-title">{template.title}</h2>
          <p>{dancerOnly ? "One 15-second video using your approved dancer photo and the observer from our reference video." : template.purchase} {mockPayment ? "Local test: simulate payment, then generate a real video. No card is required; generation consumes real provider credits." : "Pay once with Stripe; no subscription or credits. Generation begins only after the server verifies payment."}</p>
          <div className="checkout-summary"><span><strong className="checkout-duration">{template.durationSeconds}-second video</strong><br/>{resolution} · {aspectRatio} · One-time purchase</span><strong>{selectedPrice ? money(selectedPrice.amount_minor, selectedPrice.currency) : "Unavailable"}</strong></div>
          <div className="checkout-code-label">Your video code</div>
          <div className="video-code-row"><output className="video-code-value" aria-label="Video code to keep">{videoCode}</output><button type="button" className="video-code-action" onClick={() => { void navigator.clipboard.writeText(videoCode).then(() => setCodeCopied(true)).catch(() => setMessage("Select the code to copy it.")); }}><Copy size={16}/> Copy</button><a className="video-code-action" href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Zombie Video Lab video code: ${videoCode}\nKeep this browser cookie; this code alone does not grant access on other devices.\n`)}`} download={`zombie-video-code-${videoCode}.txt`} aria-label="Download video code as a text file"><Download size={16}/> Save code</a><button type="button" className="video-code-action" onClick={regenerateCode} aria-label="Generate another video code"><RefreshCw size={16}/> New</button></div>
          {codeCopied && <span className="code-copied" role="status">Code copied</span>}
          <p className="checkout-retention">Your video will remain available in this browser after a refresh for up to 3 days after it is ready. <strong>Download it within 3 days.</strong> Keep this browser’s cookies; clearing them or switching devices may remove access. Your video code alone cannot recover the video on another device.</p>
          <p className="checkout-disclaimer">{mockPayment ? "LOCAL TEST: no Stripe charge. Real AI generation costs still apply; the selected resolution and 15-second duration are sent to the provider." : testMode ? "Stripe TEST mode: use a Stripe test card. No real money is collected." : "One-time payment. If generation fails definitively, retry this paid order without paying again; contact support if assistance is needed."} By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/refund-policy">Refund Policy</a>.</p>
          <button type="button" className="checkout-primary" disabled={busy || !selectedPrice?.purchasable} onClick={() => void beginCheckout()}>{busy ? (mockPayment ? "Preparing your video…" : "Opening secure checkout…") : mockPayment ? "Simulate payment & generate" : `Pay ${selectedPrice ? money(selectedPrice.amount_minor, selectedPrice.currency) : ""} with Stripe`} <ArrowRight size={18}/></button>
          <button type="button" className="checkout-secondary" onClick={() => setCheckoutStep("closed")}>Not now</button>
        </div>
      </div>}
      <div className="preview-panel" ref={previewRef} aria-label="Video preview" aria-busy={stage === "working"}>
        <div className="preview-header"><span>{template.previewHeading} <span className="preview-line">/</span> LOOK 01</span><span className="preview-diamond">✧</span></div>
        <div className={`visual-window video-window${videoUrl ? " result-window" : " demo-window"}`}>
          {videoUrl ? <>
            <div className="demo-format-strip" aria-label={`Your video: ${playingFormat?.resolution ?? resolution}, ${playingFormat?.durationSeconds ?? template.durationSeconds} seconds, ${playingFormat?.aspectRatio ?? aspectRatio}`}>
              <span className="demo-format-title"><span className="demo-status-dot"/> YOUR VIDEO</span>
              <div className="demo-format-tags"><span>{playingFormat?.resolution ?? resolution}</span><span>{playingFormat?.durationSeconds ?? template.durationSeconds}s</span><span>{playingFormat?.aspectRatio ?? aspectRatio}</span></div>
            </div>
            <div className="result-media" style={{ aspectRatio: (playingFormat?.aspectRatio ?? aspectRatio).replace(":", "/") }}>
              <GeneratedVideo key={videoUrl} src={videoUrl} controls autoPlay playsInline preload="metadata" aria-label={`Your generated ${template.title}`}/>
            </div>
          </> : templateId === "tiptoeing-in-my-jordans" ? <TiptoeingExampleVideo /> : <DemoVideo />}
        </div>
        {videoUrl && <button type="button" className="back-to-sample" onClick={() => { setVideoUrl(null); setSelectedCode(null); setPlayingFormat(null); setStage("idle"); }}>Watch sample video <Play size={13}/></button>}
        {stage === "working" && <div className="generation-progress" role="progressbar" aria-label="Estimated video generation progress" aria-valuenow={Math.round(visualProgress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="generation-progress-text"><span>CREATING YOUR STORY</span><strong>{Math.round(visualProgress)}% <small>estimated</small></strong></div>
          <div className="generation-track"><span style={{ width: `${visualProgress}%` }}/></div>
          <p>AI rendering may take several minutes. Actual provider progress: {progress}%. You may refresh or return to this browser later.</p>
        </div>}
        <div className="preview-footer"><div><span className="preview-footer-icon"><Play size={15} fill="currentColor"/></span><div><strong>{stage === "ready" ? "Your AI video is ready" : stage === "working" ? "Generating your story" : template.previewTitle}</strong><span>{stage === "ready" ? "Watch and download within three days after generation" : stage === "working" ? "You can return to this tab to check progress" : "Watch the sample, or choose a finished video from your collection below"}</span></div></div>{videoUrl ? <a className="preview-download" href={selectedCode ? `/api/video/file?code=${encodeURIComponent(selectedCode)}&download=1` : videoUrl} download aria-label="Download generated video"><Download size={18}/></a> : <span className="preview-badge">PREVIEW</span>}</div>
        {videoUrl && <p className="export-help">Tap Download to save your video. If your mobile browser opens a preview, use its Save or Share menu. Your download is available in this browser for up to three days after generation; keep this browser cookie.</p>}
        <section className="video-history" aria-label="Your video history">
          <div className="history-heading"><div><span>YOUR PRIVATE COLLECTION</span><h3>Your videos</h3></div><button type="button" onClick={() => void refreshHistory()} aria-label="Refresh video history"><RefreshCw size={17}/></button></div>
          {historyError && <p role="alert" className="history-error">{historyError}</p>}
          {history.filter(job => job.status === "finished" && Boolean(job.videoUrl)).length === 0 ? <p className="history-empty">Your finished videos will appear here.</p> :
            <div className="history-grid">{history.filter(job => job.status === "finished" && Boolean(job.videoUrl)).map((job, index) => <article key={job.code} className={`history-card ${selectedCode === job.code ? "active" : ""}`}>
              <button type="button" className="history-preview" onClick={() => {
                if (poller.current) clearTimeout(poller.current);
                handleRef.current = null;
                setSelectedCode(job.code);
                setPlayingFormat(job);
                sessionStorage.setItem(SAVED_CODE, job.code);
                setVideoUrl(job.videoUrl ?? null);
                setProgress(100);
                setVisualProgress(100);
                setStage("ready");
                previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }} aria-label={`Play video ${job.code} in the main player`}>
                <GeneratedVideo src={job.videoUrl!} muted playsInline preload={index < 6 ? "metadata" : "none"} />
                <span className="history-play-icon" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
              </button>
              <a href={`/api/video/file?code=${encodeURIComponent(job.code)}&download=1`} download className="history-download" aria-label={`Download video ${job.code}`}><Download size={15}/> Download</a>
            </article>)}</div>}
        </section>
        {orders.length > 0 && <details className="purchases-details">
          <summary>Payments &amp; retries</summary>
          {testMode && available && <p className="history-help">Stripe test mode is active. Test purchases do not charge real money.</p>}
          {orders.length > 0 && <div className="purchase-list" aria-label="Your purchases">{orders.map(order => <article className="purchase-card" key={order.code}>
            <div><strong>{order.resolution} · {order.aspectRatio} · {money(order.amountMinor, order.currency)}</strong><span>{order.status === "paid" ? `Paid · ${order.generationStatus}` : order.status}</span></div>
            <button className="purchase-code" type="button" onClick={() => { void navigator.clipboard.writeText(order.code).then(() => setMessage("Video code copied."), () => setMessage(`Video code: ${order.code}`)); }} title="Copy video code">{order.code} <Copy size={13}/></button>
            {order.error && <p>{order.error}</p>}
            {order.status === "pending" && <button type="button" disabled={busy || !available} onClick={() => void beginCheckout(order.code)}>Resume payment</button>}
            {order.status === "paid" && order.generationStatus === "ready" && <button type="button" disabled={busy} onClick={() => void continueOrder(order)}>Continue paid order</button>}
            {order.canRetry && <button type="button" disabled={busy} onClick={() => void continueOrder(order, true)}>Retry free — already paid</button>}
            {order.status === "paid" && (order.generationStatus === "unknown" || order.generationStatus === "failed" && !order.canRetry) && <p>Do not pay again. <a href="/contact">Contact support</a> with your video code.</p>}
          </article>)}</div>}
        </details>}
      </div>
    </div>
  );
}
