import OrdersManager from "@/components/admin/OrdersManager";

export default function AdminOrdersPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">Orders</h1>
      <p className="mt-1 text-sm text-black/60">
        Review incoming orders, update fulfillment status, and see personalization details.
      </p>
      <div className="mt-6">
        <OrdersManager />
      </div>
    </div>
  );
}
