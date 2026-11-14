import {
  ArrowRight,
  Camera,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Lock,
  MapPin,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: EyeOff,
    title: "No account, no name",
    description:
      "Reporting never asks who you are. There is no sign-up, and no name, email or phone number is collected.",
  },
  {
    icon: Camera,
    title: "Photo-assisted drafting",
    description:
      "Attach a photo and the report title, category and description are drafted for you. Review and edit before sending.",
  },
  {
    icon: MapPin,
    title: "Precise location",
    description:
      "Search for an address or drop your current position with one tap, so responders know where to go.",
  },
  {
    icon: KeyRound,
    title: "Private tracking ID",
    description:
      "Each report gets a random 16-character ID. It is the only way to look the report up, so keep it safe.",
  },
  {
    icon: LayoutDashboard,
    title: "Moderator dashboard",
    description:
      "Authorised staff triage incoming reports, filter by status or urgency and update progress.",
  },
  {
    icon: Lock,
    title: "Minimal data by design",
    description:
      "Only what you type is stored. The status page shows the report itself, never who sent it.",
  },
];

const STEPS = [
  {
    title: "Describe what happened",
    text: "Pick the urgency, add a photo if you have one, and fill in the details.",
  },
  {
    title: "Save your report ID",
    text: "After submitting you get a unique ID. Copy it somewhere safe.",
  },
  {
    title: "Check for updates",
    text: "Enter your ID on the tracking page any time to see the current status.",
  },
];

export default function HomePage() {
  return (
    <div className="container">
      <section className="mx-auto flex max-w-3xl flex-col items-center pb-16 pt-20 text-center sm:pt-28">
        <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent">
          <Lock className="size-4" aria-hidden="true" />
          Anonymous by default
        </span>
        <h1 className="mt-8 animate-fade-up text-balance text-5xl font-bold tracking-tight [animation-delay:60ms] sm:text-6xl lg:text-7xl">
          Report incidents.
          <span className="text-gradient block pb-2">Protect your identity.</span>
        </h1>
        <p className="mt-6 max-w-2xl animate-fade-up text-balance text-lg leading-relaxed text-muted-foreground [animation-delay:120ms]">
          SafeReport lets anyone flag crimes and hazards in their community without
          revealing who they are, and follow up on the report later with a private ID.
        </p>
        <div className="mt-10 flex w-full animate-fade-up flex-col gap-3 [animation-delay:180ms] sm:w-auto sm:flex-row">
          <ButtonLink href="/submit-report" size="lg" className="group">
            Make an anonymous report
            <ArrowRight
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </ButtonLink>
          <ButtonLink href="/track-report" size="lg" variant="secondary">
            Track an existing report
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="py-16">
        <h2
          id="features-heading"
          className="text-center text-3xl font-bold tracking-tight"
        >
          Built for people who need to speak up safely
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <Card className="h-full p-6 transition-colors hover:border-accent/40">
                <span className="inline-flex rounded-xl bg-accent/10 p-2.5 text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className="py-16">
        <Card className="p-6 sm:p-10">
          <h2
            id="steps-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Three steps, about two minutes
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <ButtonLink href="/how-it-works" variant="link">
              Learn more about how reports are handled
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>
        </Card>
      </section>
    </div>
  );
}
