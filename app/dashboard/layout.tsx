import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderator dashboard",
  robots: { index: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
