import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import Attribution from "@/components/Attribution";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Pokémon Database & Pokédex`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  verification: { google: "rr2MVNnMBgku8-c8NzifOcy8WIIjqDl0QOaiekyTmbw" },
  keywords: ["Pokédex", "Pokémon database", "Pokémon stats", "Pokémon types", "pokeDB"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Pokémon Database & Pokédex`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/images/pokeball.png", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} – Pokémon Database & Pokédex`,
    description: SITE_DESCRIPTION,
    images: ["/images/pokeball.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-20`}
      >
        {children}
        <NavbarWrapper />
        <Attribution />
      </body>
    </html>
  );
}