import PromosManager from "@/components/admin/PromosManager";

export default function AdminPromosPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">Promo codes</h1>
      <div className="mt-6">
        <PromosManager />
      </div>
    </div>
  );
}
