import test from "node:test";
import assert from "node:assert/strict";
import { makeYirRequest, parseYirJob, parseYirJobId } from "../src/lib/yir.ts";

const ids = ["file_11111111-1111-4111-8111-111111111111", "file_22222222-2222-4222-8222-222222222222"];
test("YIR uses two reference images, not start and end frames", () => {
  const body = makeYirRequest(ids, "720p");
  assert.equal(body.input.type, "reference");
  assert.deepEqual(body.input.references.map(ref => ref.role), ["reference_image", "reference_image"]);
  assert.equal(body.parameters.duration, 8);
  assert.equal(body.parameters.resolution, "720p");
  assert.throws(() => makeYirRequest([ids[0]], "720p"));
});
test("YIR job response maps to existing frontend statuses", () => {
  assert.equal(parseYirJobId({ id: "job_123456" }), "job_123456");
  assert.equal(parseYirJob({ status: "queued" }).status, "running");
  assert.deepEqual(parseYirJob({ status: "succeeded", result: { availability: "available", files: [{ media_type: "video/mp4", url: "https://example.org/v.mp4" }] } }), { status: "finished", progress: 100, videoUrl: "https://example.org/v.mp4" });
  assert.equal(parseYirJob({ status: "failed", error: { code: "YIR_EXECUTION_FAILED" } }).status, "failed");
  assert.throws(() => parseYirJob({ status: "succeeded", result: { availability: "expired", files: [] } }));
});
