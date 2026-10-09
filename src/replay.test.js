import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleAt } from "./replay.js";
test("interpolates positions and preserves a recorded stop", () => {
  assert.equal(sampleAt(1.5).x, -30);
  assert.equal(sampleAt(6).x, -8);
  assert.equal(sampleAt(6).speed, 0);
});
test("clamps scrubbing outside the recording", () => {
  assert.equal(sampleAt(-5).x, -42);
  assert.equal(sampleAt(100).x, 42);
});
test("different rendering rates arrive at the same recorded position", () => {
  const positions = [30, 60, 144].map((fps) => {
    let elapsed = 0;
    for (let frame = 0; frame < fps * 2; frame++) elapsed += 1 / fps;
    return sampleAt(elapsed).x;
  });
  for (const x of positions) assert.ok(Math.abs(x - -26) < 1e-9);
});
