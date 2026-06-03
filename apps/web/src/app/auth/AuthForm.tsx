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
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-[var(--surface-muted)] bg-[var(--surface)]/95 shadow-2xl shadow-[#2f5d50]/12 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-950/70 dark:shadow-black/40 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#1f2722_0%,#2f5d50_58%,#7a3f32_100%)] p-8 text-[#fffdf8] lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ded6c8]">
              Bookstore Account
            </p>
            <h1 className="relative z-10 mt-5 max-w-sm text-5xl font-black leading-[0.95]">
              Keep your shelf close.
            </h1>
          </div>
          <div className="my-8 grid grid-cols-7 items-end gap-2">
            {[112, 144, 96, 160, 128, 176, 112].map((height, index) => (
                <span
                  key={index}
                  className="rounded-sm border border-[#fffdf8]/20 bg-[#fffdf8]/18"
                  style={{ height }}
                />
              ))}
          </div>
          <div className="relative rounded-2xl border border-[#fffdf8]/25 bg-[#fffdf8]/12 p-5 backdrop-blur">
            <div className="mb-3 flex gap-2">
              <span className="rounded-full bg-[#fffdf8]/85 px-3 py-1 text-xs font-bold text-[#1f2722]">
                saved reads
              </span>
              <span className="rounded-full bg-[#ded6c8] px-3 py-1 text-xs font-bold text-[#1f2722]">
                book bag
              </span>
            </div>
            <p className="text-sm leading-6 text-[#fffdf8]">
              Save your account actions for signed-in readers while keeping the
              shelves open for browsing.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6">
            <p className="mb-3 inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)] dark:bg-rose-950 dark:text-rose-100">
              {mode === "register" ? "join the list" : "back again"}
            </p>
            <h2 className="text-3xl font-black text-[var(--text)]">
              {mode === "register" ? "Create your reader account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {mode === "register"
                ? "Create your customer profile for your book bag and saved actions."
                : "Sign in to continue with your book bag and reader actions."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-full border border-[var(--surface-muted)] bg-[var(--background)] p-1 shadow-inner dark:border-gray-700 dark:bg-gray-900/80">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setConfirmPassword("");
            }}
            className={`rounded-full px-3 py-2 text-sm font-bold transition ${
              mode === "login"
                ? "bg-[var(--accent)] text-[var(--surface)] shadow-lg shadow-[#2f5d50]/20 dark:bg-white dark:text-gray-950"
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
                ? "bg-[var(--accent)] text-[var(--surface)] shadow-lg shadow-[#2f5d50]/20 dark:bg-white dark:text-gray-950"
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
                className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#2f5d50]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#2f5d50]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
              className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#2f5d50]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
                className="w-full rounded-2xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[#2f5d50]/20 dark:border-gray-700 dark:bg-gray-900/80"
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
            className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-black text-[var(--surface)] shadow-xl shadow-[#2f5d50]/25 transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
