import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create staff account",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create a staff account"
      description="New accounts start without dashboard access until an administrator approves them."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
