import test from "node:test";
import assert from "node:assert/strict";
import { makeSeedanceInput, parseTask, parseUpload } from "../src/lib/poyo.ts";

test("two portraits are references rather than first/last animation frames", () => {
  const input = makeSeedanceInput(["https://example.org/1.jpg", "https://example.org/2.jpg"], "720p");
  assert.deepEqual(input.reference_image_urls, ["https://example.org/1.jpg", "https://example.org/2.jpg"]);
  assert.equal(input.image_urls, undefined);
  assert.match(input.prompt, /@Image1/);
  assert.match(input.prompt, /@Image2/);
  assert.equal(input.duration, 8);
  assert.equal(input.resolution, "720p");
  assert.throws(() => makeSeedanceInput(["a", "b"], "1080p"), /resolution/i);
});

test("upload and task response reject missing or unsafe urls", () => {
  assert.equal(parseUpload({ success: true, data: { file_url: "https://a.example/a.png" } }), "https://a.example/a.png");
  assert.throws(() => parseUpload({ success: false, data: { file_url: "https://a.example/a.png" } }));
  assert.throws(() => parseUpload({ success: true, data: { file_url: "http://a.example/a.png" } }));
  assert.deepEqual(parseTask({ code: 200, data: { status: "finished", files: [{ file_type: "video", file_url: "https://a.example/v.mp4" }] } }), { status: "finished", progress: 100, videoUrl: "https://a.example/v.mp4" });
  assert.throws(() => parseTask({ data: { status: "finished", files: [] } }));
});
