import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center" dir="rtl">
      <div>
        <p className="text-5xl font-black text-cyanink">۴۰۴</p>
        <h1 className="mt-4 text-xl font-black">صفحه پیدا نشد</h1>
        <p className="mt-2 text-sm text-slate-500">
          ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-slate-950 px-5 py-2.5 text-xs font-bold text-white"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
