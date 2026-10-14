import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type PetSpecies = "Dog" | "Cat";

export function createPhotoValidationToken(
  bytes: Uint8Array,
  species: PetSpecies,
  secret: string,
  now = Date.now(),
): string {
  const payload = Buffer.from(JSON.stringify({
    digest: createHash("sha256").update(bytes).digest("hex"),
    species,
    expiresAt: now + 10 * 60 * 1000,
  })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyPhotoValidationToken(
  token: string,
  bytes: Uint8Array,
  secret: string,
  now = Date.now(),
): PetSpecies | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
  const receivedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);
  if (receivedBytes.length !== expectedBytes.length || !timingSafeEqual(receivedBytes, expectedBytes)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      digest?: string;
      species?: string;
      expiresAt?: number;
    };
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (decoded.digest !== digest || !decoded.expiresAt || decoded.expiresAt < now) return null;
    return decoded.species === "Dog" || decoded.species === "Cat" ? decoded.species : null;
  } catch {
    return null;
  }
}
