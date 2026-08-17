"use client";

import { useEffect, useState } from "react";

const PRODUCT_TYPES = [
  { value: "business-card", label: "Business Card" },
  { value: "review-card", label: "Review Card" },
  { value: "wifi-card", label: "Wifi Card" },
  { value: "order-card", label: "Order Card" },
];

type CardRow = {
  id: string;
  code: string;
  product_type: string;
  owner_user_id: string | null;
  claimed_at: string | null;
  created_at: string;
};

export default function CardsManager() {
  const [cards, setCards] = useState<CardRow[] | null>(null);
  const [productType, setProductType] = useState("business-card");
  const [count, setCount] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [justGenerated, setJustGenerated] = useState<{ code: string; product_type: string }[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/cards");
    const data = await res.json();
    if (res.ok) setCards(data.cards);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    const res = await fetch("/api/admin/cards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_type: productType, count: Number(count) }),
    });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setJustGenerated(data.created);
    load();
  };

  const copyGenerated = () => {
    const text = justGenerated.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <form onSubmit={generate} className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4">
        <div className="flex gap-3">
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            {PRODUCT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-24 rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={generating}
          className="self-start rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {generating ? "Generating…" : "+ Generate codes"}
        </button>
      </form>

      {justGenerated.length > 0 && (
        <div className="mt-4 rounded-2xl border border-black/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-black">
              Just generated ({justGenerated.length})
            </p>
            <button
              type="button"
              onClick={copyGenerated}
              className="rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-60"
            >
              Copy codes
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1 font-mono text-sm text-black">
            {justGenerated.map((c) => (
              <span key={c.code}>{c.code}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col">
        <p className="text-sm font-semibold text-black">All cards</p>
        {cards === null && <p className="mt-2 text-sm text-black/40">Loading…</p>}
        {cards?.length === 0 && <p className="mt-2 text-sm text-black/40">No cards yet.</p>}
        {cards?.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between gap-3 border-b border-black/10 py-3"
          >
            <div>
              <p className="font-mono font-semibold text-black">{card.code}</p>
              <p className="text-xs text-black/40">{card.product_type}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                card.claimed_at ? "bg-black/5 text-black/60" : "bg-black text-white"
              }`}
            >
              {card.claimed_at ? "Claimed" : "Unclaimed"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
