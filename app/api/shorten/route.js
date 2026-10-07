import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { sql } from "../../../lib/db";
import { toBase62, RESERVED, ALIAS_PATTERN } from "../../../lib/code";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Send the request as JSON.");
  }

  // 1. Check the long URL
  const rawUrl = String(body.url || "").trim();
  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return bad("Enter a full link that starts with http:// or https://");
  }
  if (!["http:", "https:"].includes(target.protocol) || rawUrl.length > 2048) {
    return bad("Only http and https links up to 2048 characters are allowed.");
  }
  if (target.host === new URL(request.url).host) {
    return bad("That link already points to this site.");
  }

  // 2. Check the optional alias and expiry
  const alias = String(body.alias || "").trim();
  if (alias) {
    if (!ALIAS_PATTERN.test(alias)) {
      return bad("Alias must be 3-30 characters: letters, numbers, - or _");
    }
    if (RESERVED.includes(alias.toLowerCase())) {
      return bad("That alias is reserved. Try another one.");
    }
  }
  const days = Number(body.expiresInDays) || 0;
  const expiresAt = days > 0 ? new Date(Date.now() + days * DAY) : null;

  // 3. Save it
  let code;
  try {
    if (alias) {
      const rows = await sql`
        INSERT INTO links (code, url, expires_at)
        VALUES (${alias}, ${target.href}, ${expiresAt})
        ON CONFLICT (code) DO NOTHING
        RETURNING id, code`;
      if (rows.length === 0) return bad("That alias is already taken.", 409);
      code = rows[0].code;
    } else {
      // base62 of an auto-increment id (offset so codes are at least 3 characters)
      for (let attempt = 0; attempt < 5 && !code; attempt++) {
        const [{ id }] = await sql`
          SELECT nextval(pg_get_serial_sequence('links', 'id')) AS id`;
        const candidate = toBase62(BigInt(id) + 100000n);
        const rows = await sql`
          INSERT INTO links (id, code, url, expires_at)
          VALUES (${id}, ${candidate}, ${target.href}, ${expiresAt})
          ON CONFLICT (code) DO NOTHING
          RETURNING code`;
        if (rows.length) code = rows[0].code;
      }
      if (!code) return bad("Could not create a code. Try again.", 500);
    }
  } catch (err) {
    console.error(err);
    return bad("Database error. Check your DATABASE_URL.", 500);
  }

  const origin = new URL(request.url).origin;
  const shortUrl = `${origin}/${code}`;
  const qr = await QRCode.toDataURL(shortUrl, { margin: 1, width: 240 });

  return NextResponse.json({ code, shortUrl, qr, expiresAt });
}
