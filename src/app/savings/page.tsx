import type { Metadata } from "next";
import SavingsLoader from "./SavingsLoader";

export const metadata: Metadata = { title: "Savings" };

export default function SavingsPage() {
  return <SavingsLoader />;
}
