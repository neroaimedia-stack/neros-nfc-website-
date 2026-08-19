import PromosManager from "@/components/admin/PromosManager";

export default function AdminPromosPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">Promo codes</h1>
      <p className="mt-1 text-sm text-black/60">
        Create discount codes, scope them to specific products, and toggle them on or off.
      </p>
      <div className="mt-6">
        <PromosManager />
      </div>
    </div>
  );
}
