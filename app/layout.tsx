import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import PageTransition from "@/components/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mi Asistente",
  description: "Tu agenda, lista de compras y lista de viaje en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased pb-24">
        <PageTransition>{children}</PageTransition>
        <NavBar />
      </body>
    </html>
  );
}
