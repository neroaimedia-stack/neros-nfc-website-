"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type OwnedCard = {
  id: string;
  product_type: string;
  claimed_at: string | null;
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  "business-card": "Business Card",
  "review-card": "Review Card",
  "order-card": "Order Card",
  "wifi-card": "Wifi Card",
};

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

function SignedInAccount({
  userId,
  userEmail,
  onSignOut,
}: {
  userId: string;
  userEmail: string;
  onSignOut: () => Promise<void>;
}) {
  const [cards, setCards] = useState<OwnedCard[] | null>(null);
  const [code, setCode] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claiming, setClaiming] = useState(false);

  const loadCards = async () => {
    const { data } = await supabase
      .from("cards")
      .select("id, product_type, claimed_at")
      .eq("owner_user_id", userId)
      .order("claimed_at", { ascending: false });
    setCards(data ?? []);
  };

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleClaim = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setClaimError("Please enter your activation code.");
      return;
    }
    setClaiming(true);
    setClaimError("");
    const { error } = await supabase.rpc("claim_card", { p_code: trimmed });
    setClaiming(false);
    if (error) {
      setClaimError(
        "That code doesn't match an unclaimed card. Double-check it and try again."
      );
      return;
    }
    setCode("");
    loadCards();
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-center text-3xl font-bold text-black">
        Your cards
      </h1>
      <p className="mt-3 text-center text-sm text-black/60">{userEmail}</p>

      <div className="mt-10 rounded-3xl border border-black/10 p-8 shadow-sm">
        {cards === null ? (
          <p className="text-center text-sm text-black/40">Loading…</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-sm text-black/60">
            You don&apos;t have any cards yet — tap or scan your card to set
            it up.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-black/10">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between py-4"
              >
                <span className="text-sm font-semibold text-black">
                  {PRODUCT_TYPE_LABELS[card.product_type] ?? card.product_type}
                </span>
                <span className="text-xs text-black/40">Set up</span>
              </div>
            ))}
          </div>
        )}

        <div
          className={
            cards && cards.length > 0
              ? "mt-6 border-t border-black/10 pt-6"
              : "mt-6"
          }
        >
          <label
            htmlFor="activation-code"
            className="text-sm font-medium text-black"
          >
            Have an activation code?
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="activation-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (claimError) setClaimError("");
              }}
              placeholder="e.g. DEMO-CARD-01"
              className="w-full rounded-full border border-black/15 px-4 py-2.5 text-sm uppercase outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleClaim}
              disabled={claiming}
              className="shrink-0 rounded-full border border-black px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim"}
            </button>
          </div>
          {claimError && (
            <p className="mt-2 text-xs text-red-600">{claimError}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/#buy"
          className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Browse cards
        </Link>
        <button
          type="button"
          onClick={() => onSignOut()}
          className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-60"
        >
          Sign out
        </button>
      </div>
    </main>
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
  const [formMode, setFormMode] = useState<"login" | "signup">("login");

  const switchMode = (nextMode: "login" | "signup") => {
    setFormMode(nextMode);
    setError("");
  };

  const handleSubmit = async () => {
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
    const { error: authError } =
      formMode === "login"
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
    return <SignedInAccount userId={user.id} userEmail={user.email ?? ""} onSignOut={signOut} />;
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
            handleSubmit();
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
                autoComplete={
                  formMode === "login" ? "current-password" : "new-password"
                }
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
            {submitting
              ? formMode === "login"
                ? "Logging in…"
                : "Creating account…"
              : formMode === "login"
                ? "Log In"
                : "Sign Up"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-center text-xs text-red-600">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-black/60">
          {formMode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold text-black underline underline-offset-2"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-black underline underline-offset-2"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-black/40">
        Setting up a new card? You&apos;ll be asked for the activation code
        found inside your card&apos;s packaging.
      </p>
    </main>
  );
}
