"use client";

import { useState } from "react";

export default function Shortener() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alias, expiresInDays: Number(expiresInDays) }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else setResult(data);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="url">Long link</label>
        <input
          id="url"
          type="url"
          required
          placeholder="https://example.com/a/very/long/page"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <div className="row">
          <div>
            <label htmlFor="alias">Custom alias (optional)</label>
            <input
              id="alias"
              placeholder="my-link"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="expiry">Expires</label>
            <select
              id="expiry"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            >
              <option value="0">Never</option>
              <option value="1">In 1 day</option>
              <option value="7">In 7 days</option>
              <option value="30">In 30 days</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten link"}
        </button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      {result && (
        <div className="result" aria-live="polite">
          <div className="result-main">
            <p className="result-label">Your short link</p>
            <a className="short" href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl}
            </a>
            <div className="actions">
              <button type="button" className="secondary" onClick={copy}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="btn-link" href={`/stats/${result.code}`}>
                View stats
              </a>
            </div>
          </div>
          <img src={result.qr} alt={`QR code for ${result.shortUrl}`} width="140" height="140" />
        </div>
      )}
    </section>
  );
}
