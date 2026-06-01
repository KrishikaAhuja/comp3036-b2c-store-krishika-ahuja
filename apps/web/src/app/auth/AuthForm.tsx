"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthResponse = {
  error?: string;
};

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
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-[var(--background)] p-6 shadow-sm dark:border-gray-700">
        <div className="mb-6 grid grid-cols-2 rounded-md border border-gray-200 p-1 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
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
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
          </div>

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
  );
}
