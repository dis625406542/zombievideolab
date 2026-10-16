CREATE SCHEMA IF NOT EXISTS zombievideolab_pro;
CREATE TABLE IF NOT EXISTS zombievideolab_pro.video_jobs (
 code varchar(32) PRIMARY KEY,
 visitor_hash varchar(64) NOT NULL,
 provider varchar(8) NOT NULL CHECK (provider IN ('poyo','yir')),
 task_id varchar(128),
 status varchar(16) NOT NULL CHECK (status IN ('submitting','running','finished','failed','unknown')),
 resolution varchar(4) NOT NULL CHECK (resolution IN ('480p','720p')),
 aspect_ratio varchar(4) NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16','16:9')),
 progress integer NOT NULL DEFAULT 0,
 video_url text,
 r2_key text,
 stored_at timestamptz,
 error text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS video_jobs_visitor_created_idx ON zombievideolab_pro.video_jobs(visitor_hash, created_at DESC);

-- For existing deployments run this once before enabling aspect-ratio selection:
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS aspect_ratio varchar(4) NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16','16:9'));

ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS r2_key text;
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS stored_at timestamptz;

-- Delivery readiness and R2 archival are independent. Run before deploying async delivery.
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS storage_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS storage_retry_at timestamptz;
ALTER TABLE zombievideolab_pro.video_jobs ADD COLUMN IF NOT EXISTS storage_error text;
UPDATE zombievideolab_pro.video_jobs SET completed_at=COALESCE(stored_at,updated_at)
 WHERE completed_at IS NULL AND (r2_key IS NOT NULL OR video_url IS NOT NULL);
CREATE INDEX IF NOT EXISTS video_jobs_archive_pending_idx ON zombievideolab_pro.video_jobs(storage_retry_at)
 WHERE r2_key IS NULL AND video_url IS NOT NULL;
