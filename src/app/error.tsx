"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4" dir="rtl">
      <div className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-red-700">خطایی در نمایش این بخش رخ داد</p>
        <p className="mt-3 text-xs leading-6 text-slate-500">
          اتصال خود را بررسی کنید و دوباره تلاش کنید. اگر مشکل ادامه داشت با
          پشتیبانی تماس بگیرید.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-md bg-slate-950 px-5 py-2.5 text-xs font-bold text-white"
        >
          تلاش دوباره
        </button>
      </div>
    </main>
  );
}
