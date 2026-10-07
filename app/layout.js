import "./globals.css";

export const metadata = {
  title: "Snip - short links with click stats",
  description: "Shorten a link, share it, and see who clicked.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
