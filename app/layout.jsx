import "./globals.css";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://www.tryoras.com";
const SITE_DESCRIPTION =
  "Track AI visibility, competitor mentions, prompt rankings, citations, GEO recommendations, and white-label client reports.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Oras | AI Visibility and GEO Tracking",
    template: "%s | Oras",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI visibility",
    "GEO tracking",
    "generative engine optimization",
    "ChatGPT brand monitoring",
    "AI citation tracking",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Oras",
    title: "Oras | AI Visibility and GEO Tracking",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/illustor.png",
        width: 1200,
        height: 630,
        alt: "Oras — AI visibility and GEO tracking dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oras | AI Visibility and GEO Tracking",
    description: SITE_DESCRIPTION,
    images: ["/illustor.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
