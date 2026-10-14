import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.name}  -  ${settings.role}`,
      template: `%s  -  ${settings.name}`,
    },
    description: settings.about[0],
    openGraph: {
      type: "website",
      siteName: settings.name,
      title: `${settings.name}  -  ${settings.role}`,
      description: settings.about[0],
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
    // The bootstrap script stamps data-theme before hydration, so the server
    // markup legitimately differs from the DOM React first sees.
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
