import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { PARTS } from "@/lib/parts";
import "./construct.css"; // construct-intro
import { Suspense } from "react"; // construct-intro
import { Construction } from "@/components/construct/Construction"; // construct-intro
import { CONSTRUCT_HEAD_SCRIPT } from "@/components/construct/headScript"; // construct-intro

// Display: Archivo on its width axis. The CSS sets wdth 62, the narrowest
// width in the family, for the poster-size part names.
const display = Archivo({
  variable: "--f-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Data: part numbers, pin labels and tables.
const mono = IBM_Plex_Mono({
  variable: "--f-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Voice: the sentences that are his own.
const serif = Newsreader({
  variable: "--f-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const description =
  "Srijit Ghosh is a single-chip, full-stack product engineer with an integrated “designer’s eye”. Six open-source projects with datasheets. Open to new roles.";
const homeTitle = "Srijit Ghosh · Full-stack product engineer";

// A part page sets its own title, for example "SRJT-002 BLACKBOX", and the
// template adds the name. The openGraph and twitter titles do not follow the
// template, so a part page sets them too.
export const metadata: Metadata = {
  metadataBase: new URL("https://srijit.me"),
  title: {
    default: homeTitle,
    template: "%s · Srijit Ghosh",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description,
    url: "/",
    siteName: "srijit.me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description,
    creator: "@devsrijit",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1f0ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${serif.variable}`}
      suppressHydrationWarning // construct-intro: the head script sets data-construct
    >
      {/* construct-intro: marks <html> before the first paint */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: CONSTRUCT_HEAD_SCRIPT }} />
      </head>
      <body>
        <SiteNav parts={PARTS.map((p) => ({ slug: p.slug, part: p.part, name: p.name, oneLiner: p.oneLiner }))} />
        {children}
        {/* construct-intro */}
        <Suspense fallback={null}>
          <Construction />
        </Suspense>
      </body>
    </html>
  );
}
