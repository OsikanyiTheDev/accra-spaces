import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Accra Spaces — Find property with clearer terms",
    template: "%s | Accra Spaces",
  },
  description: "A local-first way to find, compare and visit apartments, houses, shops and offices across Greater Accra.",
  openGraph: {
    title: "Accra Spaces",
    description: "Clear GHS prices, transparent terms, day and night context, and WhatsApp-first contact.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
