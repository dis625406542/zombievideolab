"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

const version = process.env.NEXT_PUBLIC_DEMO_CACHE_VERSION || "1";
const source = `/api/video/demo/file?v=${encodeURIComponent(version)}`;
const cacheName = "zvl-public-demo-v1";
const cacheMaxAge = 24 * 60 * 60 * 1000;

async function loadDemoVideo(): Promise<Blob> {
  // Cache Storage is same-origin. No R2 credential, signed link or personal video is stored.
  let cache: Cache | null = null;
  try { if ("caches" in window) cache = await caches.open(cacheName); } catch { /* private browsing or quota */ }
  if (cache) {
    const saved = await cache.match(source);
    if (saved) {
      const cachedAt = Number(saved.headers.get("X-Demo-Cached-At"));
      if (cachedAt && Date.now() - cachedAt < cacheMaxAge) return saved.blob();
      await cache.delete(source);
    }
  }
  const response = await fetch(source);
  if (!response.ok || !response.headers.get("content-type")?.startsWith("video/mp4")) throw new Error("Sample video unavailable");
  const blob = await response.blob();
  if (!blob.size || blob.size > 12 * 1024 * 1024) throw new Error("Sample video invalid");
  if (cache) {
    try {
      const headers = new Headers({ "Content-Type": "video/mp4", "X-Demo-Cached-At": String(Date.now()) });
      await cache.put(source, new Response(blob, { headers }));
      // Remove any previous demo versions so replacements do not accumulate.
      const keys = await cache.keys();
      await Promise.all(keys.filter(key => key.url !== new URL(source, location.origin).href).map(key => cache!.delete(key)));
    } catch { /* cache may be full/disabled; still play the fetched video */ }
  }
  return blob;
}

// Both previews share one download, but each owns and cleans up its object URL.
let sharedDemo: Promise<Blob> | null = null;
let sharedAt = 0;
function getDemoVideo() {
  if (!sharedDemo || Date.now() - sharedAt >= cacheMaxAge) {
    sharedAt = Date.now();
    sharedDemo = loadDemoVideo().catch(error => { sharedDemo = null; throw error; });
  }
  return sharedDemo;
}

export function DemoVideo({ lazy = false, autoPlay = true }: { lazy?: boolean; autoPlay?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(!lazy);
  useEffect(() => {
    if (active) return;
    if (!("IntersectionObserver" in window)) { setActive(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setActive(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, [active]);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    let objectUrl: string | null = null;
    setLoading(true);
    setFailed(false);
    setUrl(null);
    void getDemoVideo().then(blob => {
      const value = URL.createObjectURL(blob);
      objectUrl = value;
      if (alive) setUrl(value); else URL.revokeObjectURL(value);
    }).catch(() => { if (alive) setFailed(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [attempt, active]);

  return <div ref={container} className="demo-player">
    <div className="demo-format-strip" aria-label="Sample: 480p, 8 seconds, portrait-look footage">
      <span className="demo-format-title"><span className="demo-status-dot"/> SAMPLE VIDEO</span>
      <div className="demo-format-tags"><span>480p</span><span>8s</span><span>PORTRAIT LOOK</span></div>
    </div>
    <div className="demo-media">
      {url && !failed ? <video
        key={url} src={url} poster="/demo-poster.webp" controls autoPlay={autoPlay} muted loop playsInline preload={autoPlay ? "auto" : "metadata"}
        aria-label="Zombie couple video sample, 480p, 8 seconds, portrait-look footage"
        onError={() => setFailed(true)}
      /> : <>
        <img className="scene-image" src="/demo-poster.webp" alt="Sample preview still showing a couple in a sunlit field"/>
        <div className="demo-fallback">
          <span className="scene-caption-top">A STORY BEYOND THE END</span>
          <strong>Love survives<br/><em>everything.</em></strong>
          <p role="status">{!active ? "Sample video · Scroll to preview" : loading ? "Loading sample video…" : "Sample preview unavailable. Please try again."}</p>
          {!loading && <button type="button" onClick={() => { sharedDemo = null; setAttempt(value => value + 1); }}><RefreshCw size={14}/> Reload preview</button>}
        </div>
      </>}
    </div>
  </div>;
}
