import type { Metadata } from "next";
import { Cairo, Changa } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/chatbot";

console.log("Fetching database info...");
const url = process.env.DATABASE_URL
  console.log('DATABASE_URL:', url ?? 'NOT SET')
  console.log('Provider:', url?.startsWith('postgresql') ? 'postgresql' : url?.startsWith('file:') ? 'sqlite' : 'unknown')

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const changa = Changa({
  variable: "--font-changa",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VetDz | متجر أزياء جزائري",
  description: "متجر VetDz لعرض المنتجات وتأكيد الطلبات داخل الجزائر.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${changa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
