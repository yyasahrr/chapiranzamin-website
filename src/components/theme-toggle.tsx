"use client";

type Theme = "formal" | "brand" | "poster";

const THEMES: { value: Theme; label: string; colors: string }[] = [
  { value: "formal", label: "رسمی", colors: "from-[#0b1f4d] via-[#087f8c] to-[#c79428]" },
  { value: "brand", label: "رنگی لوگو", colors: "from-[#00b8b0] via-[#1536d8] to-[#c30ec8]" },
  { value: "poster", label: "پوستری قبلی", colors: "from-[#ff4d12] via-[#2036e8] to-[#c6f432]" },
];

function applyTheme(theme: Theme, button: HTMLButtonElement) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("chap-theme-v2", theme);
  button.closest("details")?.removeAttribute("open");
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  return (
    <details className="theme-picker relative">
      <summary
        title="انتخاب ظاهر سایت"
        className="theme-toggle flex h-9 cursor-pointer list-none items-center gap-2 border border-current/20 bg-white/80 px-2.5 text-[10px] font-black text-ink-900 backdrop-blur"
      >
        <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#0b1f4d] via-[#087f8c] to-[#c79428]" />
        {!compact && "انتخاب ظاهر"}
        <span className="text-[8px] opacity-50">⌄</span>
      </summary>
      <div className="absolute left-0 top-11 z-[80] w-40 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl">
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            type="button"
            onClick={(event) => applyTheme(theme.value, event.currentTarget)}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-right text-[10px] font-bold hover:bg-slate-100"
          >
            <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${theme.colors}`} />
            {theme.label}
          </button>
        ))}
      </div>
    </details>
  );
}
