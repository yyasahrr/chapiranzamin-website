import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getSiteUrl, isIndexingEnabled } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "چاپخانه | چاپ، تبلیغات محیطی و پروژه‌های سازمانی",
  description:
    "چاپخانه، همراه سازمان‌ها و کسب‌وکارها در طراحی، چاپ و اجرای تبلیغات محیطی، بنرهای مناسبتی و پروژه‌های سازمانی.",
  robots: {
    index: isIndexingEnabled(),
    follow: isIndexingEnabled(),
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "چاپخانه",
    title: "چاپخانه",
    description: "طراحی، چاپ و اجرای تبلیغات محیطی و پروژه‌های سازمانی",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="formal" data-scroll-behavior="smooth">
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          رفتن به محتوای اصلی
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
