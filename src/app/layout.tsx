import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "چاپ ایران‌زمین | چاپ، تبلیغات محیطی و پروژه‌های سازمانی",
  description:
    "چاپ ایران‌زمین، همراه سازمان‌ها و کسب‌وکارها در طراحی، چاپ و اجرای تبلیغات محیطی، بنرهای مناسبتی و پروژه‌های سازمانی.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
