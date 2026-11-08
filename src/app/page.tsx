import Link from "next/link";
import { CATEGORIES } from "@/config/categories";
import { formatCents } from "@/lib/money";

// M0 placeholder for the Log screen. Buttons are not wired up yet (M1/M3).
const BAND_BG: Record<string, string> = {
  breakfast: "bg-breakfast",
  lunch: "bg-lunch",
  bike: "bg-bike",
};

export default function LogPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between bg-bar px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
        <div>
          <p className="text-xs font-medium text-muted">Today</p>
          <p className="text-2xl font-extrabold">{formatCents(0)}</p>
        </div>
        <Link
          href="/savings"
          className="flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-extrabold text-ink"
        >
          Savings →
        </Link>
      </header>

      <div className="flex flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled
            className={`${BAND_BG[c.id]} flex flex-1 flex-col justify-center px-5 text-left text-ink`}
          >
            <span className="text-sm font-medium">{c.note} · 0 today</span>
            <span className="flex items-baseline justify-between text-[50px] font-extrabold leading-none">
              <span>{c.label}</span>
              <span>{formatCents(c.amountCents)}</span>
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
