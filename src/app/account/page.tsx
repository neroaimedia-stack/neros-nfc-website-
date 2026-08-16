"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | null>(null);

  const handleSubmit = async (nextMode: "login" | "signup") => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMode(nextMode);
    const { error: authError } =
      nextMode === "login"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
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
              type="email"
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
            />
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
