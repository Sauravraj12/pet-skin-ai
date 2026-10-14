import assert from "node:assert/strict";
import test from "node:test";
import { validateImageSignature } from "./image";

test("accepts JPEG, PNG, and WEBP byte signatures", () => {
  assert.equal(validateImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0x00])).valid, true);
  assert.equal(validateImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])).valid, true);
  assert.equal(validateImageSignature(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])).valid, true);
});

test("rejects unknown or empty image content regardless of file naming", () => {
  assert.equal(validateImageSignature(new Uint8Array()).valid, false);
  assert.equal(validateImageSignature(new Uint8Array([0x00, 0x01, 0x02])).valid, false);
});