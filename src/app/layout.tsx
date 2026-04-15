import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pentrumomente.ro — Strânge fonduri pentru momentele care contează",
  description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău românesc.",
  openGraph: {
    title: "pentrumomente.ro — Strânge fonduri pentru momentele care contează",
    description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute. Familia primește tot — platforma se susține printr-o mică contribuție a donatorilor.",
    url: "https://pentrumomente.ro",
    siteName: "pentrumomente.ro",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "pentrumomente.ro",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "pentrumomente.ro — Strânge fonduri pentru momentele care contează",
    description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
