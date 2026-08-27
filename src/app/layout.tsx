import type { Metadata, Viewport } from "next";
import { Inter, Great_Vibes } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Fallback documenté pour "Caramel and Vanilla" — à remplacer par next/font/local
// dès que le fichier officiel + la licence sont fournis (cf. AUDIT §10, brief §7).
const displayFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caramel-vanilla",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Danse 2 Vivre — L'association qui fait vibrer les villages",
    template: "%s · Danse 2 Vivre",
  },
  description:
    "Association Danse 2 Vivre : cours, spectacles, communauté. Rejoignez-nous dans nos villages.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Danse 2 Vivre",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121018" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${displayFont.variable}`}>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg"
          >
            Aller au contenu principal
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
