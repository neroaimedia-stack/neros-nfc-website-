"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiCopy,
  FiDownload,
  FiExternalLink,
  FiSearch,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

const PRODUCT_TYPES = [
  { value: "business-card", label: "Business Card" },
  { value: "review-card", label: "Review Card" },
  { value: "wifi-card", label: "Wifi Card" },
  { value: "order-card", label: "Order Card" },
];

const PRODUCT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PRODUCT_TYPES.map((p) => [p.value, p.label])
);

type CardRow = {
  id: string;
  code: string;
  product_type: string;
  owner_user_id: string | null;
  claimed_at: string | null;
  created_at: string;
  owner_email: string | null;
  profile_name: string | null;
  profile_avatar_url: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl bg-black/[0.03] px-4 py-3 text-center">
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="mt-0.5 text-xs text-black/50">{label}</p>
    </div>
  );
}

function CardDetails({ card }: { card: CardRow }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/c/${card.id}` : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t border-black/10 bg-black/[0.02] px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3">
        {card.profile_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.profile_avatar_url}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-black/40">
            <FiUser className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-black">
            {card.profile_name || "No profile set up yet"}
          </p>
          <p className="truncate text-xs text-black/50">
            {card.owner_email ?? "Unknown account"}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-black/40">Date claimed</dt>
          <dd className="mt-0.5 font-medium text-black">
            {card.claimed_at ? formatDate(card.claimed_at) : "—"}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-black/40">Account email</dt>
          <dd className="mt-0.5 truncate font-medium text-black">{card.owner_email ?? "—"}</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <dt className="text-black/40">Public link</dt>
          <dd className="flex items-center gap-2">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 truncate font-medium text-black underline decoration-black/20 underline-offset-2 hover:decoration-black"
            >
              /c/{card.id.slice(0, 8)}…
              <FiExternalLink className="h-3 w-3 shrink-0" />
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-full border border-black/15 p-1 text-black/50 hover:border-black/30 hover:text-black"
              aria-label="Copy public link"
            >
              <FiCopy className="h-3 w-3" />
            </button>
            {copied && <span className="text-[10px] text-green-600">Copied</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function CardsManager() {
  const [cards, setCards] = useState<CardRow[] | null>(null);
  const [productType, setProductType] = useState("business-card");
  const [count, setCount] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [justGenerated, setJustGenerated] = useState<{ code: string; product_type: string }[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  const deleteCard = async (card: CardRow) => {
    const message = card.claimed_at
      ? `Delete code "${card.code}"? This card is claimed — its owner's profile will be permanently deleted too. This can't be undone.`
      : `Delete unused code "${card.code}"? This can't be undone.`;
    if (!confirm(message)) return;
    setDeletingId(card.id);
    await fetch(`/api/admin/cards/${card.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (expanded === card.id) setExpanded(null);
    load();
  };

  const exportCsv = () => {
    if (!cards || cards.length === 0) return;
    const escape = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const header = ["Code", "Product Type", "Status", "Owner Email", "Date Claimed"];
    const rows = cards.map((c) => [
      c.code,
      PRODUCT_TYPE_LABELS[c.product_type] ?? c.product_type,
      c.claimed_at ? "Claimed" : "Unclaimed",
      c.owner_email ?? "",
      c.claimed_at ? formatDate(c.claimed_at) : "",
    ]);
    const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `herneros-nfc-cards-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCards = useMemo(() => {
    if (!cards) return null;
    const query = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (categoryFilter !== "all" && card.product_type !== categoryFilter) return false;
      if (!query) return true;
      return [card.code, card.owner_email, card.profile_name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [cards, search, categoryFilter]);

  const allClaimedCount = cards?.filter((c) => c.claimed_at).length ?? 0;
  const allTotalCount = cards?.length ?? 0;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <form
          onSubmit={generate}
          className="flex w-full flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 lg:max-w-xl"
        >
          <div className="flex gap-3">
            <div className="relative min-w-0 flex-1">
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-black/15 bg-white py-2.5 pr-10 pl-4 text-sm outline-none focus:border-black"
              >
                {PRODUCT_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-black/40" />
            </div>
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

        <div className="flex flex-1 flex-col justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-black">Overview</p>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!cards || cards.length === 0}
              className="flex items-center gap-1.5 rounded-full border border-black px-3.5 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              <FiDownload className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
          <div className="flex gap-3">
            <StatTile label="Total codes" value={allTotalCount} />
            <StatTile label="Claimed" value={allClaimedCount} />
            <StatTile label="Unclaimed" value={allTotalCount - allClaimedCount} />
          </div>
        </div>
      </div>

      {justGenerated.length > 0 && (
        <div className="mt-4 max-w-xl rounded-2xl border border-black/10 bg-white p-4">
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

      <div className="mt-8">
        <p className="text-sm font-semibold text-black">All cards</p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, email, or name"
              className="w-full rounded-full border border-black/15 bg-white py-2 pr-4 pl-9 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                categoryFilter === "all"
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/60 hover:border-black/30"
              }`}
            >
              All
            </button>
            {PRODUCT_TYPES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setCategoryFilter(p.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  categoryFilter === p.value
                    ? "border-black bg-black text-white"
                    : "border-black/15 text-black/60 hover:border-black/30"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {cards === null && <p className="mt-3 text-sm text-black/40">Loading…</p>}
        {cards?.length === 0 && <p className="mt-3 text-sm text-black/40">No cards yet.</p>}
        {cards !== null && cards.length > 0 && filteredCards?.length === 0 && (
          <p className="mt-3 text-sm text-black/40">No cards match your search.</p>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {filteredCards?.map((card) => {
            const isClaimed = !!card.claimed_at;
            const isOpen = expanded === card.id;
            return (
              <div
                key={card.id}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white"
              >
                <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    disabled={!isClaimed}
                    onClick={() => setExpanded(isOpen ? null : card.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold text-black">
                        {card.code}
                      </p>
                      <p className="text-xs text-black/40">
                        {PRODUCT_TYPE_LABELS[card.product_type] ?? card.product_type}
                      </p>
                    </div>
                  </button>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      isClaimed ? "bg-black/5 text-black/60" : "bg-black text-white"
                    }`}
                  >
                    {isClaimed ? "Claimed" : "Unclaimed"}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteCard(card)}
                    disabled={deletingId === card.id}
                    aria-label={`Delete code ${card.code}`}
                    className="shrink-0 rounded-full p-2 text-black/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                {isClaimed && isOpen && <CardDetails card={card} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
