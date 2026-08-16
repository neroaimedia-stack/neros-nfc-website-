"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.6 4.1M6.7 6.7C3.9 8.5 1.5 12 1.5 12s4 7 10.5 7a10.6 10.6 0 0 0 4.3-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export default function AccountPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | null>(null);

  const handleSubmit = async (nextMode: "login" | "signup") => {
    // Read straight from the DOM as the source of truth, not just React
    // state — browser/OS autofill (esp. iOS Safari's saved-password
    // suggestions) can fill the inputs without firing a React onChange,
    // leaving state stale even though the fields visibly have values.
    const emailValue = (emailRef.current?.value ?? email).trim();
    const passwordValue = passwordRef.current?.value ?? password;

    if (!emailValue || !passwordValue) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMode(nextMode);
    const { error: authError } =
      nextMode === "login"
        ? await signIn(emailValue, passwordValue)
        : await signUp(emailValue, passwordValue);
    setSubmitting(false);
    if (authError) setError(authError);
  };

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 text-center">
        <p className="text-sm text-black/40">Loading…</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-center text-3xl font-bold text-black">
          You&apos;re signed in
        </h1>
        <p className="mt-3 text-center text-sm text-black/60">{user.email}</p>
        <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-black/10 p-8 shadow-sm">
          <Link
            href="/#buy"
            className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            Browse cards
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-center text-3xl font-bold text-black">
        Set up your card
      </h1>
      <p className="mt-3 text-center text-sm text-black/60">
        Log in to manage your profile, or create an account to claim a new
        card.
      </p>

      <div className="mt-10 rounded-3xl border border-black/10 p-8 shadow-sm">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit("login");
          }}
        >
          <div>
            <label className="text-sm font-medium text-black" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-black"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/15 py-3 pr-11 pl-4 text-sm outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-black/40 hover:text-black"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {submitting && mode === "login" ? "Logging in…" : "Log In"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-center text-xs text-red-600">{error}</p>
        )}

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-black/40">
          <div className="h-px flex-1 bg-black/10" />
          New here
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit("signup")}
          className="w-full rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-50"
        >
          {submitting && mode === "signup"
            ? "Creating account…"
            : "Create Account"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-black/40">
        Setting up a new card? You&apos;ll be asked for the activation code
        found inside your card&apos;s packaging.
      </p>
    </main>
  );
}
