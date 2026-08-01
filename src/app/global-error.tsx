"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main style={{ padding: "4rem 1rem", textAlign: "center" }}>
          <h1>سامانه موقتاً در دسترس نیست</h1>
          <p>لطفاً چند لحظه دیگر دوباره تلاش کنید.</p>
          <button onClick={reset}>تلاش دوباره</button>
        </main>
      </body>
    </html>
  );
}
