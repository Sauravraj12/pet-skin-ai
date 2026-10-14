import assert from "node:assert/strict";
import test from "node:test";
import { createPhotoValidationToken, verifyPhotoValidationToken } from "./validationToken";

test("validation token is bound to the exact image and detected species", () => {
  const image = new Uint8Array([1, 2, 3, 4]);
  const token = createPhotoValidationToken(image, "Cat", "test-secret", 1000);

  assert.equal(verifyPhotoValidationToken(token, image, "test-secret", 1001), "Cat");
  assert.equal(verifyPhotoValidationToken(token, new Uint8Array([1, 2, 3, 5]), "test-secret", 1001), null);
  assert.equal(verifyPhotoValidationToken(token, image, "wrong-secret", 1001), null);
});

test("validation token expires after ten minutes", () => {
  const image = new Uint8Array([5, 6, 7]);
  const token = createPhotoValidationToken(image, "Dog", "test-secret", 1000);

  assert.equal(verifyPhotoValidationToken(token, image, "test-secret", 601001), null);
});