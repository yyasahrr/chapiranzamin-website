type User = {
  role: "admin" | "content_admin" | "support" | "customer";
} | null;

export type StaffRole = "admin" | "content_admin" | "support";

export function isStaff(user: User | null): user is User & { role: StaffRole } {
  return Boolean(user && ["admin", "content_admin", "support"].includes(user.role));
}

export function canAccess(user: User | null, area: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "content_admin")
    return ["cms", "blog", "files", "notifications"].includes(area);
  if (user.role === "support")
    return ["tickets", "orders", "crm", "notifications"].includes(area);
  return false;
}
