import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Indie App Marketplace: Open-Source Windows Software by Ismail",
      template: "%s: Indie App Marketplace",
    },
    description:
      "A showcase and digital storefront for open-source Windows desktop tools and applications by Ismail. Free source code on GitHub; convenient, signed, ready-to-run installers available.",
    openGraph: {
      type: "website",
      siteName: "Indie App Marketplace",
      title: "Indie App Marketplace: Open-Source Windows Software by Ismail",
      description:
        "A showcase and digital storefront for open-source Windows desktop tools and applications by Ismail. Free source code on GitHub; convenient, signed, ready-to-run installers available.",
    },
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
  };
}

/**
 * Resolve the theme before first paint so a dark-mode visitor never sees a
 * light flash. Reads the stored choice, else the OS preference.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
