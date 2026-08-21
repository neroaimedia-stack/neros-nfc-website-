"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";
import BusinessProfileEditor from "@/components/BusinessProfileEditor";

type CardRecord = {
  id: string;
  product_type: string;
  claimed_at: string | null;
};

function CardPreview({ productType }: { productType: string }) {
  switch (productType) {
    case "business-card":
      return <FlippableCard reflection={false} />;
    case "review-card":
      return <ReviewCardMock />;
    case "wifi-card":
      return <WifiCardMock />;
    case "order-card":
      return <OrderCardMock />;
    default:
      return null;
  }
}

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [card, setCard] = useState<CardRecord | null>(null);
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<"preview" | "edit">("edit");
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecked(true);
      return;
    }
    supabase
      .from("cards")
      .select("id, product_type, claimed_at")
      .eq("id", cardId)
      .maybeSingle()
      .then(({ data }) => {
        setCard(data ?? null);
        setChecked(true);
      });
  }, [user, authLoading, cardId]);

  useEffect(() => {
    return () => clearTimeout(copiedTimeoutRef.current);
  }, []);

  if (authLoading || !checked) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 text-center">
        <p className="text-sm text-black/40">Loading…</p>
      </main>
    );
  }

  if (!user || !card) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-black">Card not found</h1>
        <p className="mt-3 text-sm text-black/60">
          {user
            ? "This card doesn't exist or isn't linked to your account."
            : "Sign in to view this card."}
        </p>
        <Link
          href="/account"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          Back to your cards
        </Link>
      </main>
    );
  }

  const isBusinessCard = card.product_type === "business-card";

  const handleShare = async () => {
    const url = `${SITE_URL}/c/${card.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const backLink = (
    <Link
      href="/account"
      className="text-sm text-black/40 transition-colors hover:text-black"
    >
      ‹ Your cards
    </Link>
  );

  const buttonRow = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
        className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
          mode === "edit"
            ? "bg-black text-white"
            : "border border-black text-black hover:opacity-60"
        }`}
      >
        {mode === "edit" ? "Save" : "Edit profile"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-colors hover:opacity-60"
      >
        Share profile
      </button>
    </div>
  );

  // Business cards always render full-bleed (no padded/max-width chrome),
  // in both preview AND edit mode, so the two look structurally identical —
  // edge-to-edge cover photo, back arrow overlaid on it, mode buttons below
  // the bio. Only the field content (pencils, unfilled placeholders) should
  // differ between modes, never the page layout around it.
  // BusinessProfileEditor must stay mounted across the mode toggle (same
  // parent position, not two different top-level returns) or it remounts
  // and its fetch effect re-decides the initial mode, snapping back to
  // preview.
  return (
    <div
      className={
        isBusinessCard
          ? "flex-1"
          : "mx-auto w-full max-w-md flex-1 px-6 py-16 sm:max-w-xl md:max-w-2xl"
      }
    >
      {!isBusinessCard && backLink}

      {!isBusinessCard && (
        <div className="mt-6 rounded-3xl border border-black/10 bg-neutral-50 p-8">
          <div className="mx-auto w-48 max-w-full">
            <CardPreview productType={card.product_type} />
          </div>
        </div>
      )}

      {isBusinessCard ? (
        <BusinessProfileEditor
          cardId={card.id}
          mode={mode}
          onModeChange={setMode}
          onBack={() => router.push("/account")}
          actionButtons={buttonRow}
        />
      ) : (
        <div className="mt-8 rounded-2xl border border-black/10 bg-black/5 p-5 text-sm text-black/60">
          The profile editor for this card is coming soon — you&apos;ll be
          able to update what it opens right from here.
        </div>
      )}

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6 transition-all duration-300 ${
          copied ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg">
          Link copied!
        </div>
      </div>
    </div>
  );
}
