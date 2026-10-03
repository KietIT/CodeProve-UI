import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const segments = context.params.path;
  const route = segments.join("/");
  const allowed = /^(auth\/admin\/(login|me|change-password|logout)|admin\/(admins(\/\d+\/(status|reset-password))?|audit(?:\/me)?))$/.test(route)
    || /^admin\/exercises(?:\/CP-\d{3}(?:\/draft)?)?$/.test(route)
    || /^admin\/exercises\/drafts(?:\/CP-\d{3}(?:\/(?:validate|submit|approve|reject|publish))?)?$/.test(route);
  if (!allowed) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  if (request.method !== "GET" && request.headers.get("origin") !== origin) {
    return NextResponse.json({ detail: "Untrusted request origin" }, { status: 403 });
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  const destination = `${apiBase}/api/${route}${request.nextUrl.search}`;
  const headers = new Headers({ Origin: origin });
  const adminCookie = request.cookies.get("codeprove_admin_session")?.value;
  if (adminCookie) headers.set("Cookie", `codeprove_admin_session=${adminCookie}`);
  if (request.method !== "GET") headers.set("Content-Type", "application/json");

  try {
    const upstream = await fetch(destination, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
      redirect: "manual",
    });
    const outgoing = new Headers({ "Cache-Control": "no-store" });
    const contentType = upstream.headers.get("content-type");
    if (contentType) outgoing.set("Content-Type", contentType);
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) outgoing.set("Set-Cookie", setCookie);
    return new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
      status: upstream.status, headers: outgoing,
    });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
