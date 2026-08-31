import type { Metadata, Viewport } from "next";
import { Inter, Great_Vibes, Blaka, Cabin, Bebas_Neue } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const scriptFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const blaka = Blaka({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-blaka",
  display: "swap",
});

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-cabin",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Danse 2 Vivre — Ton Style. Ton Flow. Ton Énergie.",
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
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${scriptFont.variable} ${blaka.variable} ${cabin.variable} ${bebas.variable}`}
    >
      <body>
        <NextTopLoader
          color="#db162f"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #db162f, 0 0 5px #db162f"
        />
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
