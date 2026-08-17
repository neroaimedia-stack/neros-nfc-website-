import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicProfileView, {
  type BusinessProfileRow,
} from "@/components/PublicProfileView";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  "business-card": "Business Card",
  "review-card": "Review Card",
  "order-card": "Order Card",
  "wifi-card": "Wifi Card",
};

function StubMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-black">{title}</h1>
      <p className="mt-3 text-sm text-black/60">{body}</p>
      <Link
        href="/account"
        className="mx-auto mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Go to your account
      </Link>
    </main>
  );
}

export default async function CardScanPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  const { data: card } = await supabase
    .from("cards_public")
    .select("id, product_type, claimed")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) {
    return (
      <StubMessage
        title="Card not found"
        body="This card link doesn't match anything in our system."
      />
    );
  }

  if (!card.claimed) {
    return (
      <StubMessage
        title="This card hasn't been set up yet"
        body="Sign in and enter the activation code from your card's packaging to set it up."
      />
    );
  }

  if (card.product_type !== "business-card") {
    return (
      <StubMessage
        title={`${PRODUCT_TYPE_LABELS[card.product_type] ?? "This card"} is active`}
        body="Redirect configuration for this card type is coming soon."
      />
    );
  }

  const { data: profile } = await supabase
    .rpc("get_business_profile", { p_card_id: card.id })
    .maybeSingle<BusinessProfileRow>();

  if (!profile) {
    return (
      <StubMessage
        title="This profile hasn't been set up yet"
        body="Check back soon."
      />
    );
  }

  return (
    <main className="flex-1">
      <PublicProfileView profile={profile} />
    </main>
  );
}
