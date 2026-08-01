export type ApiPayload = {
  message?: string;
  [key: string]: unknown;
};

export async function readApiResponse<T>(
  response: Response
): Promise<T> {
  const text = await response.text();
  let payload: T;
  try {
    payload = (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error("پاسخ نامعتبر از سرور دریافت شد.");
  }

  if (!response.ok) {
    const apiPayload = payload as ApiPayload;
    throw new Error(
      typeof apiPayload.message === "string"
        ? apiPayload.message
        : "انجام درخواست ناموفق بود."
    );
  }
  return payload;
}
