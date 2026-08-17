"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type ProfileState,
  emptyProfile,
  profileFromRow,
  profileToRow,
} from "@/lib/business-profile";
import PublicProfileView from "@/components/PublicProfileView";
import EditableProfileView from "@/components/EditableProfileView";

export default function BusinessProfileEditor({
  cardId,
  mode,
  onModeChange,
  onBack,
  actionButtons,
}: {
  cardId: string;
  mode: "preview" | "edit";
  onModeChange: (mode: "preview" | "edit") => void;
  onBack?: () => void;
  actionButtons?: React.ReactNode;
}) {
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("business_profiles")
      .select("*")
      .eq("card_id", cardId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setProfile(profileFromRow(data));
          if (data.full_name) onModeChange("preview");
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // Runs once on mount to decide the initial preview/edit mode from
    // freshly-loaded data; onModeChange is stable enough not to need tracking.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const saveField = async (next: ProfileState) => {
    const { error } = await supabase
      .from("business_profiles")
      .upsert(profileToRow(cardId, next), { onConflict: "card_id" });
    if (error) throw error;
    setProfile(next);
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-black/10 p-5 text-center text-sm text-black/40">
        Loading profile…
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <PublicProfileView
        profile={profileToRow(cardId, profile)}
        onBack={onBack}
        actionButtons={actionButtons}
        isOwnerPreview
      />
    );
  }

  return (
    <EditableProfileView
      cardId={cardId}
      profile={profile}
      onSaveField={saveField}
      onBack={onBack}
      actionButtons={actionButtons}
    />
  );
}
