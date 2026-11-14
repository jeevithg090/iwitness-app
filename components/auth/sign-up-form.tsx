"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { fieldErrors, signupSchema } from "@/lib/validation";

const EMPTY = { name: "", email: "", password: "", confirmPassword: "" };

export function SignUpForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse(values);
    const nextErrors = parsed.success ? {} : fieldErrors(parsed.error);
    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Could not create the account.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-5">
        <Alert tone="success" title="Account created">
          An administrator needs to grant you moderator access before you can open the
          dashboard.
        </Alert>
        <Link
          href="/auth/signin"
          className="block text-center text-sm font-medium text-accent hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  const fields = [
    { name: "name", label: "Full name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      hint: "At least 8 characters.",
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: "password",
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {formError && <Alert tone="error">{formError}</Alert>}
      {fields.map((field) => (
        <Field
          key={field.name}
          id={field.name}
          label={field.label}
          error={errors[field.name]}
          hint={"hint" in field ? field.hint : undefined}
        >
          {(props) => (
            <Input
              {...props}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              onChange={onChange}
              required
            />
          )}
        </Field>
      ))}
      <Button type="submit" className="w-full" loading={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
