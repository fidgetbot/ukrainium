import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import { Racing_Sans_One, Carter_One } from "next/font/google";

const racingSansOne = Racing_Sans_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-racing",
  display: "swap",
});

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-carter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ukrainium",
  description: "Learn Ukrainian with flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${racingSansOne.variable} ${carterOne.variable}`}
    >
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇺🇦</text></svg>"
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
