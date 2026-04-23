import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Strânge fonduri pentru momentele care contează — pentrumomente.ro",
  description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău românesc.",
  openGraph: {
    title: "Strânge fonduri pentru momentele care contează — pentrumomente.ro",
    description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute. Distribuie link-ul. Primești banii direct în contul tău românesc.",
    url: "https://pentrumomente.ro",
    siteName: "pentrumomente.ro",
    images: [
      {
        url: "/og-image.png",
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
    title: "Strânge fonduri pentru momentele care contează — pentrumomente.ro",
    description: "Creează o pagină de donații pentru un eveniment de viață în 3 minute.",
    images: ["/og-image.png"],
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
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VVK7K1RRLS" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VVK7K1RRLS');
        `}</Script>
      </body>
    </html>
  );
}
