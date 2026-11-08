import type { Metadata } from "next";
import Link from "next/link";
import { formatCents } from "@/lib/money";

export const metadata: Metadata = { title: "Savings" };

// M0 placeholder for the Savings screen. Real data arrives in M4.
export default function SavingsPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-bar px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
      <Link
        href="/"
        className="flex min-h-11 w-fit items-center rounded-full bg-paper px-4 text-sm font-extrabold text-ink"
      >
        ← Log
      </Link>
      <p className="mt-8 text-sm font-medium text-muted">All time</p>
      <p className="text-[104px] font-extrabold leading-none">{formatCents(0)}</p>
      <p className="mt-6 text-muted">History and totals coming in Milestone M4.</p>
    </main>
  );
}
