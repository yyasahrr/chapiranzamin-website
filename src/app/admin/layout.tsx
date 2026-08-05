import type { ReactNode } from "react";
import type { Metadata } from "next";
import AdminShell from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "پنل مدیریت | چاپخانه",
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
