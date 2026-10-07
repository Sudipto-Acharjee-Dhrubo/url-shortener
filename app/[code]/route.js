import { NextResponse } from "next/server";
import { sql } from "../../lib/db";
import { cacheGet, cacheSet } from "../../lib/redis";
import { parseDevice, parseReferrer } from "../../lib/code";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { code } = await params;

  // 1. Look in Redis first, then fall back to Postgres
  let link = await cacheGet(code);
  if (!link) {
    const rows = await sql`
      SELECT id, url, expires_at FROM links WHERE code = ${code}`;
    if (rows.length === 0) {
      return NextResponse.redirect(new URL("/?notice=missing", request.url));
    }
    link = {
      id: String(rows[0].id),
      url: rows[0].url,
      expiresAt: rows[0].expires_at ? new Date(rows[0].expires_at).toISOString() : null,
    };
    let ttl = 3600;
    if (link.expiresAt) {
      ttl = Math.min(ttl, Math.floor((new Date(link.expiresAt) - Date.now()) / 1000));
    }
    if (ttl > 0) await cacheSet(code, link, ttl);
  }

  // 2. Expired?
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return NextResponse.redirect(new URL("/?notice=expired", request.url));
  }

  // 3. Record the click (analytics)
  try {
    await sql`
      INSERT INTO clicks (link_id, referrer, device)
      VALUES (${link.id}, ${parseReferrer(request.headers.get("referer"))},
              ${parseDevice(request.headers.get("user-agent") || "")})`;
  } catch (err) {
    console.error("click log failed", err);
  }

  // 302 (not 301) so browsers ask us every time and every click is counted
  return NextResponse.redirect(link.url, 302);
}
