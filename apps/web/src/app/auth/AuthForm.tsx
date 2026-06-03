"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthResponse = {
  error?: string;
  user?: {
    role: "CUSTOMER" | "ADMIN";
  };
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

function getAdminUrl() {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL;
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:3002";
  }

  return "";
}

export function AuthForm({ nextPath = "/" }: { nextPath?: string }) {
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

      const loginResult = await submitAuthForm("/api/auth/login", {
        email,
        password,
      });

      if (loginResult.user?.role === "ADMIN") {
        const adminUrl = getAdminUrl();

        if (adminUrl) {
          window.location.assign(adminUrl);
          return;
        }

        await fetch("/api/auth/logout", { method: "POST" });
        setError("Admin accounts need to sign in through the admin app.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/75 bg-white/74 shadow-2xl shadow-rose-200/35 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-950/70 dark:shadow-black/40 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#b8d8d8_0%,#f4c7c3_52%,#d7c7f4_100%)] p-8 text-gray-950 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-14 top-8 h-44 w-44 rounded-full border border-white/45 bg-white/20" />
          <div className="absolute bottom-16 right-10 h-28 w-28 rounded-full bg-white/35 blur-md" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/25 blur-sm" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-700">
              Book Nook Club
            </p>
            <h1 className="relative z-10 mt-5 max-w-sm text-5xl font-black leading-[0.95]">
              Your next read deserves main character access.
            </h1>
          </div>
          <div className="relative rounded-2xl border border-white/55 bg-white/35 p-5 backdrop-blur">
            <div className="mb-3 flex gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-gray-900">
                saved reads
              </span>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-gray-900">
                book bag
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-800">
              Keep your picks, checkout quicker, and come back to the reads
              you were eyeing without starting over.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6">
            <p className="mb-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-rose-700 dark:bg-rose-950 dark:text-rose-100">
              {mode === "register" ? "join the list" : "back again"}
            </p>
            <h2 className="text-3xl font-black text-[var(--text)]">
              {mode === "register" ? "Make it yours" : "Run it back"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {mode === "register"
                ? "Create your customer profile and keep your checkout flow smooth."
                : "Sign in with your customer details and pick up where you left off."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-full border border-gray-200 bg-white/70 p-1 shadow-inner dark:border-gray-700 dark:bg-gray-900/80">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setConfirmPassword("");
            }}
            className={`rounded-full px-3 py-2 text-sm font-bold transition ${
              mode === "login"
                ? "bg-gray-950 text-white shadow-lg shadow-gray-950/20 dark:bg-white dark:text-gray-950"
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
            className={`rounded-full px-3 py-2 text-sm font-bold transition ${
              mode === "register"
                ? "bg-gray-950 text-white shadow-lg shadow-gray-950/20 dark:bg-white dark:text-gray-950"
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
                className="w-full rounded-2xl border border-rose-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-200/60 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-rose-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-200/60 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-rose-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-200/60 dark:border-gray-700 dark:bg-gray-900/80"
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
                className="w-full rounded-2xl border border-rose-100 bg-white/82 px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-200/60 dark:border-gray-700 dark:bg-gray-900/80"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#9fb8d9,#d8a7b1_48%,#b8d8c0)] px-4 py-3 text-sm font-black text-gray-950 shadow-xl shadow-rose-200/40 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
