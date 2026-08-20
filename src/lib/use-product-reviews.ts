"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export type PublicReview = {
  rating: number;
  message: string | null;
  created_at: string;
};

export function useProductReviews(productSlug: string) {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myMessage, setMyMessage] = useState("");
  const [hasMyReview, setHasMyReview] = useState(false);
  // Whether the signed-in user has an order containing this product —
  // reviews are limited to verified purchasers, checked server-side too
  // (RLS insert policy calls the same has_ordered_product function), so
  // this is purely for UI messaging, not the actual enforcement.
  const [canReview, setCanReview] = useState(false);

  const load = useCallback(async () => {
    if (!productSlug) {
      setLoading(false);
      return;
    }
    const [orderRes, ratingRes, reviewsRes] = await Promise.all([
      supabase
        .from("product_order_counts")
        .select("order_count")
        .eq("product_slug", productSlug)
        .maybeSingle(),
      supabase
        .from("product_rating_summary")
        .select("average_rating, review_count")
        .eq("product_slug", productSlug)
        .maybeSingle(),
      supabase
        .from("product_reviews_public")
        .select("rating, message, created_at")
        .eq("product_slug", productSlug)
        .limit(50),
    ]);
    setOrderCount(orderRes.data?.order_count ?? 0);
    setAverageRating(
      ratingRes.data ? Number(ratingRes.data.average_rating) : null
    );
    setReviewCount(ratingRes.data?.review_count ?? 0);
    setReviews(reviewsRes.data ?? []);
    setLoading(false);
  }, [productSlug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || !productSlug) {
      setHasMyReview(false);
      setMyRating(0);
      setMyMessage("");
      setCanReview(false);
      return;
    }
    supabase
      .from("product_reviews")
      .select("rating, message")
      .eq("product_slug", productSlug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHasMyReview(true);
          setMyRating(data.rating);
          setMyMessage(data.message ?? "");
        } else {
          setHasMyReview(false);
        }
      });
    supabase
      .rpc("has_ordered_product", { p_product_slug: productSlug })
      .then(({ data }) => setCanReview(Boolean(data)));
  }, [user, productSlug]);

  const submitReview = useCallback(
    async (rating: number, message: string) => {
      if (!user) return { error: "Not signed in" };
      try {
        // A plain insert, not an upsert — reviews are one-time. A repeat
        // attempt hits the (product_slug, user_id) unique constraint and
        // fails, which the UI never offers a path to anyway since the
        // form is replaced by a read-only view once hasMyReview is true.
        const { error } = await supabase.from("product_reviews").insert({
          product_slug: productSlug,
          user_id: user.id,
          rating,
          message: message.trim() || null,
        });
        if (!error) {
          setHasMyReview(true);
          setMyRating(rating);
          setMyMessage(message.trim());
          // A failure here (e.g. a transient network error) must not throw
          // past this point, or the caller's "submitting" state never
          // clears and the submit button looks permanently stuck.
          await load().catch(() => {});
        }
        return { error: error?.message ?? null };
      } catch (err) {
        return { error: err instanceof Error ? err.message : "Something went wrong." };
      }
    },
    [user, productSlug, load]
  );

  return {
    orderCount,
    averageRating,
    reviewCount,
    reviews,
    loading,
    user,
    myRating,
    myMessage,
    hasMyReview,
    canReview,
    submitReview,
  };
}
