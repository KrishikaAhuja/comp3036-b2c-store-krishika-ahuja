"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthResponse = {
  error?: string;
};

const MIN_PASSWORD_LENGTH = 8;

async function submitAuthForm(url: string, data: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(body.error || "Something went wrong.");
  }

  return body;
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function validateForm() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (mode === "register" && !trimmedName) {
      return "Enter your name.";
    }

    if (!trimmedEmail) {
      return "Enter your email address.";
    }

    if (!trimmedEmail.includes("@")) {
      return "Enter a valid email address.";
    }

    if (!password) {
      return "Enter your password.";
    }

    if (mode === "register" && password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (mode === "register" && password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);

    try {
      if (mode === "register") {
        await submitAuthForm("/api/auth/register", {
          name,
          email,
          password,
        });
      }

      await submitAuthForm("/api/auth/login", {
        email,
        password,
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10">
      <div className="grid w-full overflow-hidden rounded-lg border border-gray-200 bg-[var(--background)] shadow-sm dark:border-gray-700 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-[var(--wsu)] p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em]">
              Full-Stack Store
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              Access your customer account
            </h1>
          </div>
          <p className="text-sm leading-6 text-white/85">
            Sign in to continue shopping, or create a customer account for
            checkout and order access.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              {mode === "register" ? "Create account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {mode === "register"
                ? "Use your email and a secure password to register."
                : "Use your customer email and password to sign in."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-md border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setConfirmPassword("");
            }}
            className={`rounded px-3 py-2 text-sm font-medium ${
              mode === "login"
                ? "bg-[var(--text)] text-[var(--background)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`rounded px-3 py-2 text-sm font-medium ${
              mode === "register"
                ? "bg-[var(--text)] text-[var(--background)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            Register
          </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--wsu)] dark:border-gray-700"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--wsu)] dark:border-gray-700"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--wsu)] dark:border-gray-700"
              minLength={mode === "register" ? MIN_PASSWORD_LENGTH : undefined}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
            />
            {mode === "register" && (
              <p className="text-xs text-[var(--text-secondary)]">
                Use at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Repeat password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--wsu)] dark:border-gray-700"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[var(--wsu)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--wsu-light)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending
              ? "Please wait"
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
