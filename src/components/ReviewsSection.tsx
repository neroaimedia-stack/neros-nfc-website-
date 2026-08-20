"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { FiUser } from "react-icons/fi";
import { StarDisplay, StarPicker } from "@/components/StarRating";
import ExpandableList from "@/components/ExpandableList";
import type { PublicReview } from "@/lib/use-product-reviews";

function formatRelativeDate(iso: string) {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function ReviewsSection({
  productTitle,
  reviews,
  loading,
  user,
  myRating,
  myMessage,
  hasMyReview,
  canReview,
  submitReview,
}: {
  productTitle: string;
  reviews: PublicReview[];
  loading: boolean;
  user: User | null;
  myRating: number;
  myMessage: string;
  hasMyReview: boolean;
  canReview: boolean;
  submitReview: (
    rating: number,
    message: string
  ) => Promise<{ error: string | null }>;
}) {
  const [rating, setRating] = useState(myRating);
  const [message, setMessage] = useState(myMessage);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setRating(myRating);
    setMessage(myMessage);
  }, [myRating, myMessage]);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    let submitErr: string | null = null;
    try {
      ({ error: submitErr } = await submitReview(rating, message));
    } finally {
      setSubmitting(false);
    }
    if (submitErr) {
      setError("Something went wrong submitting your review.");
      return;
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <div className="mt-16 border-t border-black/10 pt-12">
      <h2 className="text-xl font-bold text-black">Reviews</h2>

      {!hasMyReview && (
        <div className="mt-6 rounded-2xl border border-black/10 p-6">
          {!user ? (
            <p className="text-sm text-black/60">
              <Link
                href="/account"
                className="font-semibold text-black underline underline-offset-2"
              >
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          ) : !canReview ? (
            <p className="text-sm text-black/60">
              Only customers who&apos;ve ordered {productTitle} can leave a review.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-black">Leave a review</p>
              <p className="mt-1 text-xs text-black/40">
                Posted anonymously — your name is never shown. You can only review
                once, so make it count.
              </p>
              <div className="mt-3">
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your experience (optional)"
                rows={3}
                className="mt-3 w-full resize-none rounded-2xl border border-black/15 p-4 text-sm outline-none focus:border-black"
              />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-3 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {submitting ? "Saving…" : done ? "Saved ✓" : "Submit review"}
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="py-6 text-sm text-black/40">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-sm text-black/40">
            No reviews yet — be the first.
          </p>
        ) : (
          <ExpandableList
            items={reviews}
            max={3}
            className="flex flex-col divide-y divide-black/10"
            renderItem={(r, i) => {
              const isMine =
                hasMyReview &&
                r.rating === myRating &&
                (r.message ?? "").trim() === myMessage.trim();
              return (
                <div key={i} className="flex items-start gap-3 py-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/40">
                    <FiUser className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <StarDisplay value={r.rating} />
                      <span className="text-xs text-black/40">
                        {formatRelativeDate(r.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-black/40">
                      {isMine ? "You" : "Anonymous"} · Ordered {productTitle}
                    </p>
                    {r.message && (
                      <p className="mt-2 text-sm text-black/70">{r.message}</p>
                    )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
