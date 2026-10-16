"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

const version = process.env.NEXT_PUBLIC_DEMO_CACHE_VERSION || "1";
const source = `/api/video/demo/file?v=${encodeURIComponent(version)}`;
const cacheName = "zvl-public-demo-v1";
const cacheMaxAge = 24 * 60 * 60 * 1000;

async function loadDemoVideo(): Promise<string> {
  // Cache Storage is same-origin. No R2 credential, signed link or personal video is stored.
  let cache: Cache | null = null;
  try { if ("caches" in window) cache = await caches.open(cacheName); } catch { /* private browsing or quota */ }
  if (cache) {
    const saved = await cache.match(source);
    if (saved) {
      const cachedAt = Number(saved.headers.get("X-Demo-Cached-At"));
      if (cachedAt && Date.now() - cachedAt < cacheMaxAge) return URL.createObjectURL(await saved.blob());
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
  return URL.createObjectURL(blob);
}

export function DemoVideo() {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    setLoading(true);
    setFailed(false);
    setUrl(null);
    void loadDemoVideo().then(value => {
      objectUrl = value;
      if (alive) setUrl(value); else URL.revokeObjectURL(value);
    }).catch(() => { if (alive) setFailed(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [attempt]);

  return <>
    <div className="demo-format-strip" aria-label="Sample: 480p, 8 seconds, portrait-look footage">
      <span className="demo-format-title"><span className="demo-status-dot"/> SAMPLE VIDEO</span>
      <div className="demo-format-tags"><span>480p</span><span>8s</span><span>PORTRAIT LOOK</span></div>
    </div>
    <div className="demo-media">
      {url && !failed ? <video
        key={url} src={url} poster="/nightfall.svg" controls autoPlay muted loop playsInline preload="auto"
        aria-label="Zombie couple video sample, 480p, 8 seconds, portrait-look footage"
        onError={() => setFailed(true)}
      /> : <>
        <img className="scene-image" src="/nightfall.svg" alt="Concept illustration of a zombie and survivor under moonlight, not a video output"/>
        <div className="demo-fallback">
          <span className="scene-caption-top">A STORY BEYOND THE END</span>
          <strong>Love survives<br/><em>everything.</em></strong>
          <p role="status">{loading ? "Loading sample video…" : "Concept illustration · Video preview unavailable"}</p>
          {!loading && <button type="button" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={14}/> Reload preview</button>}
        </div>
      </>}
    </div>
  </>;
}
