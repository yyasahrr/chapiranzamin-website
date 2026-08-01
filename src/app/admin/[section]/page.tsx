"use client";

import { useParams } from "next/navigation";
import AdminModule from "@/components/admin-module";

export default function AdminModulePage() {
  const { section } = useParams<{ section: string }>();
  return <AdminModule section={section} />;
}
