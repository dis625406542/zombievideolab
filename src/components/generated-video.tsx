"use client";

import { useState, type VideoHTMLAttributes } from "react";

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & { src: string };

// Retry a failed provider source against our archived copy only once per source.
// Never retry generation or initiate a payment because of a playback failure.
export function GeneratedVideo({ src, onError, controls, ...props }: Props) {
  const [failure, setFailure] = useState<{ src: string; backupFailed: boolean } | null>(null);
  const backup = src.startsWith("/api/video/file?") ? `${src}&source=r2` : null;
  const usingBackup = failure?.src === src && Boolean(backup);
  const unavailable = failure?.src === src && failure.backupFailed;
  return <>
    <video {...props} controls={controls} src={usingBackup ? backup! : src} onError={event => {
      if (!usingBackup && backup) setFailure({ src, backupFailed: false });
      else { setFailure({ src, backupFailed: true }); onError?.(event); }
    }} />
    {controls && unavailable && <p className="video-playback-error" role="alert">
      Your video was generated, but playback could not load. Try the download button or refresh this page. Do not pay again.
    </p>}
  </>;
}
