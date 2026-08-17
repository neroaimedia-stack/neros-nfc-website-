"use client";

import { useEffect, useState } from "react";

type Promo = {
  code: string;
  discount_rate: number;
  active: boolean;
  created_at: string;
};

export default function PromosManager() {
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/promos");
    const data = await res.json();
    if (res.ok) setPromos(data.promos);
  };

  useEffect(() => {
    load();
  }, []);

  const addPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rate = Number(percent) / 100;
    setSaving(true);
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, discount_rate: rate }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setCode("");
    setPercent("");
    load();
  };

  const toggleActive = async (promo: Promo) => {
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    });
    load();
  };

  const deletePromo = async (promo: Promo) => {
    if (!confirm(`Delete promo code "${promo.code}"? This can't be undone.`)) return;
    await fetch(`/api/admin/promos/${encodeURIComponent(promo.code)}`, {
      method: "DELETE",
    });
    load();
  };

  return (
    <div>
      <form onSubmit={addPromo} className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="min-w-0 flex-1 rounded-xl border border-black/15 px-4 py-2.5 text-sm uppercase outline-none focus:border-black"
          />
          <input
            type="number"
            placeholder="% off"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            required
            className="w-24 rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? "Adding…" : "+ Add promo code"}
        </button>
      </form>

      <div className="mt-6 flex flex-col">
        {promos === null && <p className="text-sm text-black/40">Loading…</p>}
        {promos?.length === 0 && <p className="text-sm text-black/40">No promo codes yet.</p>}
        {promos?.map((promo) => (
          <div
            key={promo.code}
            className="flex items-center justify-between gap-3 border-b border-black/10 py-3"
          >
            <div>
              <p className="font-semibold text-black">{promo.code}</p>
              <p className="text-xs text-black/40">
                {Math.round(promo.discount_rate * 100)}% off · {promo.active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => toggleActive(promo)}
                className="rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-60"
              >
                {promo.active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => deletePromo(promo)}
                className="rounded-full border border-red-600 px-3 py-1.5 text-xs font-semibold text-red-600 transition-opacity hover:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
