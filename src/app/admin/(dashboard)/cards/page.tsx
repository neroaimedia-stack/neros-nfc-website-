import CardsManager from "@/components/admin/CardsManager";

export default function AdminCardsPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black">NFC cards</h1>
      <div className="mt-6">
        <CardsManager />
      </div>
    </div>
  );
}
