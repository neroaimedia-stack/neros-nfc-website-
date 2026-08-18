import InventoryManager from "@/components/admin/InventoryManager";

export default function AdminInventoryPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">Inventory</h1>
      <p className="mt-1 text-sm text-black/60">
        Update prices, manage variants, and control stock or pre-order availability.
      </p>
      <div className="mt-6">
        <InventoryManager />
      </div>
    </div>
  );
}
