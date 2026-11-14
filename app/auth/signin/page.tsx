import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthCard
      title="Staff sign in"
      description="For moderators reviewing reports. Reporters never need an account."
      footer={
        <>
          Need staff access?{" "}
          <Link href="/auth/signup" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
