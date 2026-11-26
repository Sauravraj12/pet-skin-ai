import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/api/admin/")
    || request.nextUrl.pathname.startsWith("/api/veterinary/");
  if (!isProtected) return NextResponse.next();

  const secret = process.env.ADMIN_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const [scheme, credential] = authorization.split(" ");
  let suppliedSecret = "";
  if (scheme?.toLowerCase() === "bearer") suppliedSecret = credential || "";
  if (scheme?.toLowerCase() === "basic") {
    try {
      const decoded = atob(credential || "");
      suppliedSecret = decoded.includes(":") ? decoded.slice(decoded.indexOf(":") + 1) : "";
    } catch {
      suppliedSecret = "";
    }
  }
  const authorized = Boolean(secret && secret !== "changeme" && !secret.startsWith("replace-with") && suppliedSecret === secret);

  if (authorized) return NextResponse.next();

  return NextResponse.json(
    { success: false, message: "Unauthorized." },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Bearer realm="Pet Skin AI admin"',
        "Cache-Control": "no-store",
      },
    },
  );
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
