import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
    Key: process.env.R2_DEMO_VIDEO_KEY?.trim() || "demo1.mp4",
  }));
}

export async function getDemoVideoSource() {
  const config = getR2Config();
  if (!config) return null;
  const client = r2Client(config);
  const expiresIn = 3600;
  const url = await getSignedUrl(client, new GetObjectCommand({
    Bucket: config.bucket,
    Key: process.env.R2_DEMO_VIDEO_KEY?.trim() || "demo1.mp4",
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
  }), { abortSignal: AbortSignal.timeout(90000) });
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

export function storageConfigured() { return !!getR2Config(); }
export type InputPhoto = { key: string; type: string };
function inputConfig(key: string) {
  const config = getR2Config();
  if (!config || !/^inputs\/[A-F0-9]{32}\/[01]-[0-9a-f-]{36}\.image$/.test(key)) throw new Error("Private input unavailable.");
  return config;
}
export async function putInputPhoto(order: string, index: number, file: File): Promise<InputPhoto> {
  const key = `inputs/${order}/${index}-${crypto.randomUUID()}.image`;
  const config = inputConfig(key);
  await r2Client(config).send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type, CacheControl: "private, no-store" }));
  return { key, type: file.type };
}
export async function readInputPhotos(photos: InputPhoto[]) {
  if (photos.length !== 2) throw new Error("Two saved photos are required.");
  return Promise.all(photos.map(async (photo, i) => {
    const config = inputConfig(photo.key);
    const result = await r2Client(config).send(new GetObjectCommand({Bucket: config.bucket, Key: photo.key}));
    if (!result.Body || (result.ContentLength ?? 0) > 10 * 1024 * 1024) throw new Error("Saved photo unavailable.");
    return new File([Uint8Array.from(await result.Body.transformToByteArray()).buffer], `portrait-${i}.image`, {type: photo.type});
  }));
}
export async function deleteInputPhotos(photos: InputPhoto[]) {
  await Promise.all(photos.map(async ({key}) => {
    const config = inputConfig(key);
    await r2Client(config).send(new DeleteObjectCommand({Bucket:config.bucket,Key:key}));
  }));
}

// Public demo only. The key is fixed server-side; no user-supplied object keys.
export async function getTinyDeskSampleObject(range?: string) {
  const config = getR2Config();
  if (!config) return null;
  return r2Client(config).send(new GetObjectCommand({
    Bucket: config.bucket,
    Key: "tiny-desk-ai/sample-dogs.mp4",
    ...(range ? { Range: range } : {}),
  }));
}