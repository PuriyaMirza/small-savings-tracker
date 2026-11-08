import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getEntries } from "@/lib/queries";
import SavingsLoader from "./SavingsLoader";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = { title: "Savings" };

export default function SavingsPage() {
  return (
    <>
      <Suspense fallback={<p className="px-5 pt-6 text-muted">Loading…</p>}>
        <SavingsData />
      </Suspense>
      <div className="flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SignOutButton />
      </div>
    </>
  );
}

async function SavingsData() {
  let email: string;
  try {
    email = (await requireUser()).email;
  } catch {
    redirect("/signin");
  }
  const entries = await getEntries(email);
  return <SavingsLoader entries={entries} />;
}
