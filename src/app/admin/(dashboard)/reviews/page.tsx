import AdminReviewsManager from "@/components/admin/AdminReviewsManager";

export default function AdminReviewsPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">Reviews</h1>
      <p className="mt-1 text-sm text-black/60">
        Add, edit, or delete product reviews and feedback.
      </p>
      <div className="mt-6">
        <AdminReviewsManager />
      </div>
    </div>
  );
}
