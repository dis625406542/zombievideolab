# Zombie Video Lab

A Next.js + TypeScript + plain CSS starter adapted from the **framework conventions** of CleanStmt. No CleanStmt user data, credentials, payment account, or product logic has been copied.

## Private video generation: switch between YIR and PoYo

Copy the relevant examples from `.env.example` into your **untracked** `.env.local` and run `npm install && npm run dev`. Generation is available only on a local development server when `VIDEO_GENERATION_ENABLED=true`; production is hard-disabled.

- **YIR:** `VIDEO_PROVIDER=yir`, `YIR_API_KEY=...`, `VIDEO_HANDLE_SECRET=...` (a stable, random 32+ character string). Optional `YIR_MODEL_ID=bytedance/seedance-2.0` (default). Before paying for a real test, verify this model supports **two reference images, 8 seconds, 9:16 and your selected 480p/720p** via your YIR account's `GET /v1/models?include=parameters` model contract. If not, choose a supported model. If the contract declares `subject_references`, optionally set `YIR_REFERENCE_SUBJECTS=true` for named `@Image1`/`@Image2` references; otherwise references use image order. A nonbillable quote is requested before Submit; unsupported options or unavailable quotes fail closed. Submit omits the optional `max_cost`: there is no application per-job cost ceiling, and actual provider charges (including billable fallback attempts) apply. Quote is an estimate, not the customer sale price.
- **PoYo:** `VIDEO_PROVIDER=poyo` (default) and `poyo_seedance_token=...` (or `POYO_API_KEY=...`). Its existing Seedance 2.5 upload/submit/poll implementation is retained. Keep both providers' keys and the same `VIDEO_HANDLE_SECRET` while changing the switch so outstanding task handles still poll the original provider. Restart the dev server after editing `.env.local`.

Two consenting-adult photos (JPG/PNG/WebP, 10 MB each) are uploaded from our server to the selected provider after you press **Simulate payment & generate**. This is **demo checkout, not a real charge to the visitor**; the selected provider may still bill your API account. Each request asks for 8 seconds, the selected 9:16 or 16:9 format, and 480p/720p. English prompt is loaded from `public/Prompt`. YIR creates file upload plans, PUTs multipart content to presigned URLs, completes and waits for files to become ready, quotes, submits with an idempotency key, then polls `GET /v1/jobs/{id}`. PoYo uses its original stream upload, submit and task status endpoints.

The 32-character Video Code is generated automatically and shown again during demo checkout. No email address is requested and no email is sent. A signed HttpOnly cookie (not the code alone) authorizes same-browser history and downloads; losing the cookie loses access. Database jobs survive restarts. Never automatically resubmit an uncertain paid provider request. Testing permits at most two new submissions per process per day; this is not public abuse prevention. Production generation and real checkout remain disabled. Do not expose a dev server to the public internet.

Provider-completed MP4s are archived server-side into private R2 objects under `generated/<code>.mp4`. A completed provider video is available immediately, even while archival is pending. Failed copies retain the provider URL and retry without paying or generating again. Playback prefers the trusted provider URL and can fall back to R2. Downloads prefer a signed R2 URL with `Content-Disposition: attachment`; while R2 is pending, the authenticated endpoint streams the trusted provider video as an attachment without buffering the entire file. Cookie ownership, paid-order state and the three-day completion-based availability window are checked before either action. **Separately configure an R2 lifecycle rule for the `generated/` prefix to delete after three days**; access expiration does not physically remove objects. Do not set bucket-wide deletion: keep `demo1.mp4` and any other public samples untouched. Set `PROVIDER_VIDEO_HOSTS` to exact, verified media hostnames (never paste signed result URLs into config). Arbitrary hosts, private DNS addresses and redirects are blocked. An expired provider source without a successful R2 copy needs provider support.

Run `src/lib/video-jobs.sql` on the database before deploying the application; the current local database has been migrated. R2 credentials need bucket-scoped **Object Read & Write**. Restart the dev server after changing `.env.local`. No paid provider generation is performed by builds or tests.

YIR official API reference: https://yir.ai/docs/reference/videos/quote-video-generation , https://yir.ai/docs/reference/videos/submit-video-generation , https://yir.ai/docs/reference/files/create-files , https://yir.ai/docs/reference/jobs/get-job . No billable generation is run by build or tests.

## Before public launch

1. Confirm both providers' commercial/likeness terms and real two-person reference outputs with a consented paid test; inspect credits, model policy and generated-video link expiry.
2. Add persistent paid orders, verified checkout webhooks, durable atomic rate limits and reserved per-order cost budget. Restrict upload, polling and video download by anonymous signed order code.
3. Configure and verify the three-day R2 `generated/` lifecycle rule, observability for pending copies, and a durable background ingestion worker (currently retry requires client polling); design authenticated paid-order retry/refunds separately.
4. Review legal/privacy pages, publish real pricing/refunds/retention and verify mobile Safari/Android on devices. Never publish either provider key.

## Verification and SEO

```bash
npm run typecheck
npm run build
npm audit --audit-level=high
```

The home page has one keyword-led H1, index/follow metadata, a canonical URL, robots.txt and sitemap.xml. Keyword measurements count main content including expandable FAQ answers, not hidden accessibility labels or metadata. For the requested ~2% density, measure complete, case-insensitive appearances of `zombie couple video generator` divided by the page word count (AITDK style), not occurrences multiplied by the four words in the phrase. A locally rendered DOM count is only an approximation; verify the deployed page with AITDK as well. Expandable FAQ answers may be counted by the crawler even when collapsed visually. Never claim a ranking guarantee from a density score.

The responsive tool uses two JPG/PNG/WebP images up to 10 MB each, consent confirmation, 480p/720p and 9:16/16:9 selection with private R2 video playback after a successful copy in local testing. This is not a real-device Safari certification. Dev and production builds use separate output directories.

## Public trust pages and search setup

Public routes: `/about`, `/privacy`, `/terms`, `/security`, `/refund-policy`, `/contact`; the homepage links to them and they appear in the sitemap. All describe the private, configurable video-provider integration, not a launched paid AI video service. Before payment review, verify the `hello@zombievideolab.com` mailbox and have the operator review legal identity, provider data handling, refund eligibility and delivery timing. These drafts are not proof of processor approval.

Once the production domain is deployed, confirm HTTPS, canonical URLs, robots and sitemap. Verify a Google Search Console domain property via DNS or configure `GOOGLE_SITE_VERIFICATION` privately for a URL-prefix property; submit `/sitemap.xml` to GSC and Bing. Submission and public crawlability do not guarantee indexing or recommendation by ChatGPT. The local, Git-ignored retrospective and remaining launch checklist are in `docs/2026-10-15-holiday-launch-lessons.md`.


## Private video history (anonymous, no login)
Run `src/lib/video-jobs.sql` once on your PostgreSQL connection. Set `DATABASE_PRO_URL` and a stable 32+ character `VIDEO_HANDLE_SECRET` (do not rotate while visitors need history). The schema is `zombievideolab_pro` even when the underlying database is named `postgres`; the `schema` URL query alone is not applied by node-postgres. The browser gets a 90-day signed HttpOnly visitor cookie; codes are also cached in localStorage for selection, but **neither a code nor a fingerprint authenticates a visitor**. Same-browser history survives reloads/restarts; clearing cookies or changing browsers/devices loses access. The gallery lists the latest 50 tasks and checks running tasks while the page is open. Existing jobs from before the database migration were only in process memory and cannot be imported after a restart. No payments are collected by the demo checkout; these are not paid orders. Finished videos are copied to private R2 where possible. Only successful copies have a playable result; the three-day R2 lifecycle rule still requires configuration in your Cloudflare dashboard.

Switch YIR from 2.0 to **2.5** with `YIR_MODEL_ID=bytedance/seedance-2.5` and restart. YIR's model contract as checked October 15, 2026 lists reference_image support for two portraits, 8-second duration, 480p/720p and 9:16 in reference mode. A live quote and duration/resolution/aspect-ratio validation run before submission. There is no application cost cap; monitor the provider wallet and charges. Do not assume two reference photos always reproduce two identities faithfully. The local `sslmode=require` connection follows libpq-compatible TLS semantics, which encrypts but does not authenticate the server certificate; prefer `sslmode=verify-full` with a trusted CA for production.

## Cloudflare R2 public sample

The fixed `demo1.mp4` example (720p, 16:9, approximately 8 seconds) is served via same-origin `/api/video/demo/file` and cached only as a public sample in browser Cache Storage. Set `R2_DEMO_VIDEO_KEY=demo1.mp4` locally and in Vercel Production; an existing explicit value overrides the code default. All sample players share this source and use `/demo1-poster.webp`. The cache key includes the new sample identity so old cached `demo.mp4` bytes are not reused; `NEXT_PUBLIC_DEMO_CACHE_VERSION` can invalidate later revisions. No user photo or private video is placed in this sample cache. Keep the bucket private, credentials server-only, and the three-day lifecycle rule restricted to `generated/` (not demo files).

Official reference: https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
Token setup: https://developers.cloudflare.com/r2/api/tokens/

## Current one-time prices (October 17, 2026)

- 480p: **$5.99 USD**, unchanged.
- 720p: **$8.99 USD**. Live product `prod_VS1fHFYOCvvI7M`, Price `price_1URDwELzNDgCYzhlmIxki9Bo`.
- The generator and checkout read the database catalog; FAQ and refund-policy copy match these prices. Existing orders keep their original snapshots.
- `scripts/update-720p-live-price-20261017.sql` is an explicit, guarded, idempotent update for the existing production catalog, not an automatic startup migration. It does not alter 480p, existing orders, or test Stripe mappings. The catalog amount is shared across environments: a local test checkout needs a matching $8.99 sandbox Price before it can exercise the new 720p price. A test API key cannot verify a live Price.
- The homepage walkthrough now displays two compressed screenshots in order: `generator-walkthrough-back.webp`, then `generator-walkthrough-back1.webp`. Both stay uncropped and use the same content width as the generator/demo section.
