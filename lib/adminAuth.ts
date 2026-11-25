import { timingSafeEqual } from "node:crypto";

export function isAdminAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret === "changeme" || secret.startsWith("replace-with")) return false;

  const authorization = request.headers.get("authorization") || "";
  const [scheme, encoded] = authorization.split(" ");
  if (!encoded) return false;

  let credential = encoded;
  if (scheme?.toLowerCase() === "basic") {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    credential = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : "";
  } else if (scheme?.toLowerCase() !== "bearer") {
    return false;
  }

  const supplied = Buffer.from(credential);
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
