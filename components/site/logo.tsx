import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg font-semibold tracking-tight"
      aria-label="SafeReport home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg">SafeReport</span>
    </Link>
  );
}
