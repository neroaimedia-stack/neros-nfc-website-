import { StarDisplay } from "@/components/StarRating";

export default function RatingSummary({
  averageRating,
  reviewCount,
  orderCount,
}: {
  averageRating: number | null;
  reviewCount: number;
  orderCount: number;
}) {
  if (averageRating === null && orderCount === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
      {averageRating !== null && (
        <span className="flex items-center gap-1.5">
          <StarDisplay value={averageRating} />
          <span className="font-medium text-black">
            {averageRating.toFixed(1)}
          </span>
          <span>
            ({reviewCount} review{reviewCount === 1 ? "" : "s"})
          </span>
        </span>
      )}
      {orderCount > 0 && (
        <span className="text-black/40">
          {averageRating !== null ? "· " : ""}
          {orderCount} sold
        </span>
      )}
    </div>
  );
}
