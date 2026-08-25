import type { Metadata, Viewport } from "next";
import { Rubik, Nunito_Sans, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const rubik = Rubik({
  variable: "--font-heading-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer-raw",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stock Manager",
  description: "Manage stock, sales, and expenses",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${nunitoSans.variable} ${notoSansKhmer.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
