import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function Stats({ params }) {
  const { code } = await params;

  const links = await sql`
    SELECT id, code, url, created_at, expires_at FROM links WHERE code = ${code}`;
  if (links.length === 0) notFound();
  const link = links[0];

  const [totals, devices, referrers, recent] = await Promise.all([
    sql`SELECT COUNT(*)::int AS total FROM clicks WHERE link_id = ${link.id}`,
    sql`SELECT device, COUNT(*)::int AS n FROM clicks
        WHERE link_id = ${link.id} GROUP BY device ORDER BY n DESC`,
    sql`SELECT referrer, COUNT(*)::int AS n FROM clicks
        WHERE link_id = ${link.id} GROUP BY referrer ORDER BY n DESC LIMIT 5`,
    sql`SELECT clicked_at, referrer, device FROM clicks
        WHERE link_id = ${link.id} ORDER BY clicked_at DESC LIMIT 10`,
  ]);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const shortUrl = `${proto}://${h.get("host")}/${link.code}`;
  const qr = await QRCode.toDataURL(shortUrl, { margin: 1, width: 240 });
  const total = totals[0].total;
  const expired = link.expires_at && new Date(link.expires_at) < new Date();

  return (
    <>
      <p><a className="back" href="/">Make another link</a></p>
      <h1 className="stats-title">{shortUrl}</h1>
      <p className="dest">Points to <span className="mono">{link.url}</span></p>
      {expired && <p className="notice">This link has expired and no longer redirects.</p>}

      <div className="stats-top">
        <div className="big">
          <span className="big-num">{total}</span>
          <span className="big-label">{total === 1 ? "click" : "clicks"}</span>
        </div>
        <img src={qr} alt={`QR code for ${shortUrl}`} width="120" height="120" />
      </div>

      <div className="grid">
        <section>
          <h2>Devices</h2>
          {devices.length === 0 ? <p className="empty">No clicks yet. Share the link to start counting.</p> : (
            <ul>{devices.map((d) => <li key={d.device}><span>{d.device}</span><b>{d.n}</b></li>)}</ul>
          )}
        </section>
        <section>
          <h2>Top sources</h2>
          {referrers.length === 0 ? <p className="empty">Sources appear after the first click.</p> : (
            <ul>{referrers.map((r) => <li key={r.referrer}><span>{r.referrer}</span><b>{r.n}</b></li>)}</ul>
          )}
        </section>
      </div>

      <section>
        <h2>Latest clicks</h2>
        {recent.length === 0 ? <p className="empty">Nothing yet.</p> : (
          <ul className="recent">
            {recent.map((c, i) => (
              <li key={i}>
                <span className="mono">{new Date(c.clicked_at).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</span>
                <span>{c.referrer} / {c.device}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
