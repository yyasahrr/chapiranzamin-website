import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "حساب کاربری | چاپخانه",
  robots: { index: false, follow: false, noarchive: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
