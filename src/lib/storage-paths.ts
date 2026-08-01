import path from "node:path";

const isVercel = process.env.VERCEL === "1";

export function getWritableDataRoot() {
  if (process.env.APP_DATA_DIR?.trim()) return process.env.APP_DATA_DIR.trim();
  if (isVercel) return "/tmp/chapiranzamin";
  return path.join(process.cwd(), ".data");
}

export function getOrderUploadsDir() {
  return path.join(getWritableDataRoot(), "order-uploads");
}
