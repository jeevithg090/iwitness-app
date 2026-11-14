import type { Metadata } from "next";
import {
  ArrowRight,
  ClipboardList,
  Info,
  KeyRound,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "How it works",
  description: "What happens to an anonymous report after you submit it on SafeReport.",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "Submit your report",
    text: "Choose emergency or non-emergency, pick a category and describe what happened. A photo and location are optional but help responders. If you add a photo, it can draft the title and description for you; you can edit everything before sending.",
  },
  {
    icon: KeyRound,
    title: "Receive a private report ID",
    text: "The server generates a random 16-character ID for your report. It is shown once on screen. Copy it: it is the only way to look the report up again.",
  },
  {
    icon: UserCheck,
    title: "Moderators review it",
    text: "Authorised staff see new reports in a dashboard, sorted by date and filterable by urgency and status. They mark reports as in progress, resolved or dismissed.",
  },
  {
    icon: Search,
    title: "Track progress",
    text: "Enter your ID on the tracking page to see the current status and when it was last updated, with no account required.",
  },
];

const PRIVACY = [
  {
    title: "What is stored",
    text: "The report type, category, title, description, the location you enter and an optional photo.",
  },
  {
    title: "What is not stored",
    text: "No name, email, phone number or account is attached to a report. The app does not save IP addresses with reports.",
  },
  {
    title: "Who can see it",
    text: "Signed-in moderators see full reports. Anyone with the report ID can see its status and text, but never the photo or exact coordinates.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 sm:py-20">
      <PageHeader
        eyebrow="Understanding the process"
        icon={Info}
        title={
          <>
            How SafeReport works
            <span className="text-gradient mt-2 block text-2xl sm:text-3xl">
              From submission to resolution
            </span>
          </>
        }
        description="A plain-language walkthrough of what happens to a report and what data is kept."
      />

      <ol className="mx-auto mt-14 grid max-w-3xl gap-4">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title}>
            <Card className="flex gap-5 p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-accent">Step {index + 1}</p>
                <h2 className="mt-1 text-xl font-semibold">{title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <section aria-labelledby="privacy-heading" className="mx-auto mt-16 max-w-5xl">
        <Card className="p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-accent" aria-hidden="true" />
            <h2 id="privacy-heading" className="text-2xl font-bold tracking-tight">
              Your data, plainly
            </h2>
          </div>
          <dl className="mt-8 grid gap-8 md:grid-cols-3">
            {PRIVACY.map((item) => (
              <div key={item.title}>
                <dt className="font-semibold">{item.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-muted-foreground">
            Anonymity also depends on what you write: avoid details that could identify
            you.
          </p>
        </Card>
      </section>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Ready to make a report?</h2>
        <ButtonLink href="/submit-report" size="lg" className="group mt-6">
          Start an anonymous report
          <ArrowRight
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </ButtonLink>
      </div>
    </div>
  );
}
