import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { themeInitScript } from "@/components/site/theme-toggle";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const description =
  "Report incidents anonymously, attach a photo for AI-assisted drafting, and track progress with a private report ID.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SafeReport: Anonymous incident reporting",
    template: "%s · SafeReport",
  },
  description,
  applicationName: "SafeReport",
  openGraph: {
    type: "website",
    siteName: "SafeReport",
    title: "SafeReport: Anonymous incident reporting",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeReport: Anonymous incident reporting",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#070709" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.12),transparent_65%)]"
            />
            <Navbar />
            <main id="main" className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
