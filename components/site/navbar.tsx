"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/submit-report", label: "Submit report" },
  { href: "/track-report", label: "Track report" },
  { href: "/how-it-works", label: "How it works" },
];

function EmergencyLink({ className }: { className?: string }) {
  return (
    <a
      href="tel:911"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full bg-destructive/10 px-3.5 text-sm font-medium text-destructive ring-1 ring-inset ring-destructive/25 transition-colors hover:bg-destructive/15",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-destructive" />
      </span>
      <Phone className="size-3.5 sm:hidden" aria-hidden="true" />
      <span>
        <span className="sr-only">Emergency: call </span>
        <span className="hidden sm:inline" aria-hidden="true">
          Emergency:{" "}
        </span>
        911
      </span>
    </a>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  const staffLink = isStaff
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/auth/signin", label: "Staff sign in" };

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu; focus moves into it when opened and back when closed.
  useEffect(() => {
    if (!open) return;
    const button = menuButtonRef.current;
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      button?.focus();
    };
  }, [open]);

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
      pathname.startsWith(href) ? "text-foreground" : "text-muted-foreground",
    );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <a
        href="#main"
        className="sr-only left-4 top-3 z-[60] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main"
        className="container flex h-16 items-center justify-between gap-4"
      >
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={linkClass(link.href)}
                aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={staffLink.href}
            className={cn(linkClass(staffLink.href), "hidden md:block")}
          >
            {staffLink.label}
          </Link>
          <EmergencyLink />
          <ThemeToggle />
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 top-16 z-40 bg-background/85 backdrop-blur-sm animate-in fade-in-0"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            ref={panelRef}
            className="absolute inset-x-0 top-16 z-50 border-b bg-background px-4 pb-6 pt-2 shadow-lg animate-in slide-in-from-top-2"
          >
            <ul className="flex flex-col">
              {[...NAV_LINKS, staffLink].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted",
                      pathname.startsWith(link.href)
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                    aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
