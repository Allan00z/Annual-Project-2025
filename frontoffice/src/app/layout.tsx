import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/component/navBar.component";
import "./globals.css";
import Footer from "@/component/footer.component";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audelweiss Craft",
  description: "🌿 Créations artisanales uniques & personnalisées, faites main dans les Hautes-Alpes. Boutique en ligne dès 4€.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased lg:px-20 xl:px-50`}
      >
        <NavBar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
