"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import FlippableCard from "@/components/FlippableCard";
import ReviewCardMock from "@/components/ReviewCardMock";
import WifiCardMock from "@/components/WifiCardMock";
import OrderCardMock from "@/components/OrderCardMock";
import BusinessProfileEditor from "@/components/BusinessProfileEditor";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  "business-card": "Business Card",
  "review-card": "Review Card",
  "order-card": "Order Card",
  "wifi-card": "Wifi Card",
};

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
  const { user, loading: authLoading } = useAuth();
  const [card, setCard] = useState<CardRecord | null>(null);
  const [checked, setChecked] = useState(false);

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

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16 sm:max-w-xl md:max-w-2xl">
      <Link
        href="/account"
        className="text-sm text-black/40 transition-colors hover:text-black"
      >
        ‹ Your cards
      </Link>

      {!isBusinessCard && (
        <div className="mt-6 rounded-3xl border border-black/10 bg-neutral-50 p-8">
          <div className="mx-auto w-48 max-w-full">
            <CardPreview productType={card.product_type} />
          </div>
        </div>
      )}

      <h1 className="mt-6 text-2xl font-bold text-black">
        {PRODUCT_TYPE_LABELS[card.product_type] ?? card.product_type}
      </h1>
      {card.claimed_at && (
        <p className="mt-1 text-sm text-black/40">
          Claimed {new Date(card.claimed_at).toLocaleDateString()}
        </p>
      )}

      <Link
        href={`/c/${card.id}`}
        target="_blank"
        className="mt-2 inline-block text-sm font-semibold text-black underline underline-offset-2 hover:opacity-60"
      >
        View public profile ›
      </Link>

      {isBusinessCard ? (
        <BusinessProfileEditor cardId={card.id} />
      ) : (
        <div className="mt-8 rounded-2xl border border-black/10 bg-black/5 p-5 text-sm text-black/60">
          The profile editor for this card is coming soon — you&apos;ll be
          able to update what it opens right from here.
        </div>
      )}
    </main>
  );
}
