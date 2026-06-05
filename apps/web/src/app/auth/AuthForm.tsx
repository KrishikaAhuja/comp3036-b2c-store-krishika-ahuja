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
  const [notice, setNotice] = useState("");
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
    setNotice("");

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

        setMode("login");
        setName("");
        setPassword("");
        setConfirmPassword("");
        setNotice("Account created. Please sign in to continue.");
        return;
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--surface)] p-8 shadow-2xl shadow-[#4b1f2f]/12"
      >
        <div className="mb-6 text-center">
          <h1 className="font-['Times_New_Roman',serif] text-3xl font-bold text-[var(--text)]">
            {mode === "register" ? "Create your reader account" : "Reader sign in"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {mode === "register"
              ? "Create an account for your book bag and reader actions."
              : "Sign in to continue with your book bag and reader actions."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-[var(--surface-muted)] bg-[var(--background)] p-1 shadow-inner dark:border-gray-700 dark:bg-gray-900/80">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
              setConfirmPassword("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              mode === "login"
                ? "bg-[var(--accent)] text-[var(--surface)] shadow-lg shadow-[#4b1f2f]/20 dark:bg-white dark:text-gray-950"
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
              setNotice("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              mode === "register"
                ? "bg-[var(--accent)] text-[var(--surface)] shadow-lg shadow-[#4b1f2f]/20 dark:bg-white dark:text-gray-950"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
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
                className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#4b1f2f]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#4b1f2f]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#4b1f2f]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
                className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#4b1f2f]/20 dark:border-gray-700 dark:bg-gray-900/80"
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

          {notice && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-black text-[var(--surface)] shadow-xl shadow-[#4b1f2f]/25 transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {pending
              ? "Please wait"
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
