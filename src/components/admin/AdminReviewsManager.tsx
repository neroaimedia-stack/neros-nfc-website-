"use client";

import { useEffect, useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { StarDisplay, StarPicker } from "@/components/StarRating";

type Review = {
  id: string;
  product_slug: string;
  product_title: string;
  user_id: string | null;
  added_by_admin: boolean;
  rating: number;
  message: string | null;
  created_at: string;
};

type ProductOption = { slug: string; title: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReviewsManager() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [filterSlug, setFilterSlug] = useState("all");

  const [newSlug, setNewSlug] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newMessage, setNewMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    if (res.ok) {
      setReviews(data.reviews);
      setProducts(data.products);
      if (!newSlug && data.products[0]) setNewSlug(data.products[0].slug);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReviews = useMemo(() => {
    if (!reviews) return null;
    if (filterSlug === "all") return reviews;
    return reviews.filter((r) => r.product_slug === filterSlug);
  }, [reviews, filterSlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug) {
      setAddError("Choose a product.");
      return;
    }
    setAdding(true);
    setAddError("");
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_slug: newSlug, rating: newRating, message: newMessage }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setAddError(data.error ?? "Something went wrong.");
      return;
    }
    setNewRating(5);
    setNewMessage("");
    load();
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditMessage(review.message ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: editRating, message: editMessage }),
    });
    setSaving(false);
    if (res.ok) {
      setEditingId(null);
      load();
    }
  };

  const deleteReview = async (review: Review) => {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setDeletingId(review.id);
    await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  };

  return (
    <div>
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white shadow-sm p-4"
      >
        <p className="text-sm font-semibold text-black">Add a review</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <select
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-black sm:w-56"
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
          <StarPicker value={newRating} onChange={setNewRating} />
        </div>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Feedback (optional)"
          rows={2}
          className="resize-none rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
        {addError && <p className="text-xs text-red-600">{addError}</p>}
        <button
          type="submit"
          disabled={adding}
          className="self-start rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {adding ? "Adding…" : "+ Add review"}
        </button>
      </form>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-black">All reviews</p>
        <select
          value={filterSlug}
          onChange={(e) => setFilterSlug(e.target.value)}
          className="rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-xs font-medium outline-none focus:border-black"
        >
          <option value="all">All products</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {reviews === null && <p className="mt-3 text-sm text-black/40">Loading…</p>}
      {reviews?.length === 0 && <p className="mt-3 text-sm text-black/40">No reviews yet.</p>}
      {reviews !== null && reviews.length > 0 && filteredReviews?.length === 0 && (
        <p className="mt-3 text-sm text-black/40">No reviews for this product.</p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {filteredReviews?.map((review) => {
          const isEditing = editingId === review.id;
          return (
            <div
              key={review.id}
              className="rounded-2xl border border-black/10 bg-white shadow-sm p-4"
            >
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <StarPicker value={editRating} onChange={setEditRating} />
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    rows={2}
                    className="resize-none rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(review.id)}
                      disabled={saving}
                      className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-full border border-black/15 px-5 py-2 text-xs font-semibold text-black hover:border-black/30"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StarDisplay value={review.rating} />
                        <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-black/60">
                          {review.product_title}
                        </span>
                        {review.added_by_admin && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            Added by admin
                          </span>
                        )}
                      </div>
                      {review.message && (
                        <p className="mt-2 text-sm text-black/70">{review.message}</p>
                      )}
                      <p className="mt-1 text-xs text-black/40">{formatDate(review.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(review)}
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/5 hover:text-black"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReview(review)}
                        disabled={deletingId === review.id}
                        aria-label="Delete review"
                        className="rounded-full p-2 text-black/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
