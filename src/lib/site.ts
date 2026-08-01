const fallbackUrl = "http://localhost:3000";

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    fallbackUrl;
  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

export function isIndexingEnabled(): boolean {
  const siteUrl = new URL(getSiteUrl());
  return (
    (process.env.VERCEL_ENV === "production" ||
      process.env.SITE_ENV === "production") &&
    siteUrl.protocol === "https:" &&
    !["localhost", "127.0.0.1"].includes(siteUrl.hostname)
  );
}
