import type { Metadata } from "next";
import SavingsLoader from "./SavingsLoader";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = { title: "Savings" };

export default function SavingsPage() {
  return (
    <>
      <SavingsLoader />
      <div className="flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SignOutButton />
      </div>
    </>
  );
}
