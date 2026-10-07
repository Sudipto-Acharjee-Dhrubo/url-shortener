import Shortener from "../components/Shortener";

const NOTICES = {
  missing: "That short link doesn't exist. Check the spelling or make a new one below.",
  expired: "That short link has expired. Make a new one below.",
};

export default async function Home({ searchParams }) {
  const { notice } = await searchParams;

  return (
    <>
      <header className="hero">
        <p className="cut" aria-hidden="true">
          <span className="cut-long">https://www.example.com/blog/2026/10/how-to-build-a-url-shortener?utm_source=newsletter&utm_campaign=</span>
          <span className="cut-keep">snip.app/a1B2c</span>
        </p>
        <h1>Shorten the link. Keep the numbers.</h1>
        <p className="lead">
          Paste a long link, get a short one with a QR code, and see how many
          people clicked it.
        </p>
      </header>

      {notice && NOTICES[notice] && (
        <p className="notice" role="status">{NOTICES[notice]}</p>
      )}

      <Shortener />

      <footer className="foot">
        Built with Next.js, Neon Postgres and Upstash Redis.
      </footer>
    </>
  );
}
