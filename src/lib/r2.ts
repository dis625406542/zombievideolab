import "server-only";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Server-only credentials. Never expose an API that signs an arbitrary visitor-supplied key.
function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  if (!/^[a-f0-9]{32}$/i.test(accountId)) throw new Error("Invalid R2 account configuration");
  // Jurisdictional buckets reject requests sent to the global endpoint.
  const jurisdiction = process.env.R2_JURISDICTION?.trim().toLowerCase() || "global";
  if (!["global", "us", "eu", "fedramp"].includes(jurisdiction)) throw new Error("Invalid R2 jurisdiction configuration");
  return { accountId, accessKeyId, secretAccessKey, bucket, jurisdiction };
}

function r2Client(config: NonNullable<ReturnType<typeof getR2Config>>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.${config.jurisdiction === "global" ? "" : `${config.jurisdiction}.`}r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
}

export async function getDemoVideoObject() {
  const config = getR2Config();
  if (!config) return null;
  return r2Client(config).send(new GetObjectCommand({
    Bucket: config.bucket,
    Key: process.env.R2_DEMO_VIDEO_KEY?.trim() || "demo.mp4",
  }));
}

export async function getDemoVideoSource() {
  const config = getR2Config();
  if (!config) return null;
  const client = r2Client(config);
  const expiresIn = 3600;
  const url = await getSignedUrl(client, new GetObjectCommand({
    Bucket: config.bucket,
    Key: process.env.R2_DEMO_VIDEO_KEY?.trim() || "demo.mp4",
    ResponseContentType: "video/mp4",
    ResponseContentDisposition: "inline",
  }), { expiresIn });
  return { url, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() };
}

// Generated files are private; only a server-controlled key derived from a random video code is accepted.
export async function putGeneratedVideo(code: string, body: Buffer) {
  const config = getR2Config();
  if (!config) throw new Error("R2 credentials are missing.");
  if (!/^[A-F0-9]{32}$/.test(code)) throw new Error("Invalid video code.");
  const key = `generated/${code}.mp4`;
  await r2Client(config).send(new PutObjectCommand({
    Bucket: config.bucket, Key: key, Body: body, ContentType: "video/mp4",
    CacheControl: "private, no-store",
  }));
  return key;
}
export async function getGeneratedVideoUrl(key: string, download = false) {
  const config = getR2Config();
  if (!config || !/^generated\/[A-F0-9]{32}\.mp4$/.test(key)) throw new Error("Private video unavailable.");
  return getSignedUrl(r2Client(config), new GetObjectCommand({
    Bucket: config.bucket, Key: key, ResponseContentType: "video/mp4",
    ResponseContentDisposition: download ? "attachment; filename=zombie-couple-video.mp4" : "inline",
  }), { expiresIn: 300 });
}
