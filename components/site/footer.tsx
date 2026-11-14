import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container flex flex-col gap-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm">
            If anyone is in immediate danger, call your local emergency number first.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link className="hover:text-foreground" href="/submit-report">
                Submit a report
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/track-report">
                Track a report
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/how-it-works">
                How it works
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground" href="/auth/signin">
                Staff sign in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
