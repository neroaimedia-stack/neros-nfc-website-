"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TagListInput from "@/components/TagListInput";
import SocialLinksEditor, { type SocialLink } from "@/components/SocialLinksEditor";
import MultiEntryEditor from "@/components/MultiEntryEditor";
import ImageUploadField from "@/components/ImageUploadField";
import PublicProfileView, {
  type BusinessProfileRow,
} from "@/components/PublicProfileView";

type Interests = {
  music: string[];
  movies: string[];
  games: string[];
  tvShows: string[];
  sports: string[];
};

const emptyInterests: Interests = {
  music: [],
  movies: [],
  games: [],
  tvShows: [],
  sports: [],
};

type ProfileState = {
  full_name: string;
  job_title: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  email: string;
  phone_numbers: string[];
  social_links: SocialLink[];
  hobbies: string[];
  relationship_status: string;
  current_city: string;
  hometown: string;
  birthday: string;
  gender: string;
  languages: string[];
  works: Record<string, string>[];
  education: Record<string, string>[];
  interests: Interests;
  travel_places: string[];
  links: Record<string, string>[];
};

const emptyProfile: ProfileState = {
  full_name: "",
  job_title: "",
  bio: "",
  avatar_url: null,
  cover_url: null,
  email: "",
  phone_numbers: [],
  social_links: [],
  hobbies: [],
  relationship_status: "",
  current_city: "",
  hometown: "",
  birthday: "",
  gender: "",
  languages: [],
  works: [],
  education: [],
  interests: emptyInterests,
  travel_places: [],
  links: [],
};

const RELATIONSHIP_OPTIONS = [
  "",
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "It's complicated",
  "Prefer not to say",
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <h3 className="text-sm font-bold text-black">{title}</h3>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-black">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-black"
      />
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  );
}

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          setProfile({
            full_name: data.full_name ?? "",
            job_title: data.job_title ?? "",
            bio: data.bio ?? "",
            avatar_url: data.avatar_url ?? null,
            cover_url: data.cover_url ?? null,
            email: data.email ?? "",
            phone_numbers: data.phone_numbers ?? [],
            social_links: data.social_links ?? [],
            hobbies: data.hobbies ?? [],
            relationship_status: data.relationship_status ?? "",
            current_city: data.current_city ?? "",
            hometown: data.hometown ?? "",
            birthday: data.birthday ?? "",
            gender: data.gender ?? "",
            languages: data.languages ?? [],
            works: data.works ?? [],
            education: data.education ?? [],
            interests: { ...emptyInterests, ...(data.interests ?? {}) },
            travel_places: data.travel_places ?? [],
            links: data.links ?? [],
          });
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

  const buildRow = (): BusinessProfileRow => ({
    card_id: cardId,
    full_name: profile.full_name || null,
    job_title: profile.job_title || null,
    bio: profile.bio || null,
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
    email: profile.email || null,
    phone_numbers: profile.phone_numbers,
    social_links: profile.social_links,
    hobbies: profile.hobbies,
    relationship_status: profile.relationship_status || null,
    current_city: profile.current_city || null,
    hometown: profile.hometown || null,
    birthday: profile.birthday || null,
    gender: profile.gender || null,
    languages: profile.languages,
    works: profile.works,
    education: profile.education,
    interests: profile.interests,
    travel_places: profile.travel_places,
    links: profile.links,
  });

  const update = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateInterest = (key: keyof Interests, value: string[]) => {
    setProfile((prev) => ({
      ...prev,
      interests: { ...prev.interests, [key]: value },
    }));
  };

  const handleSave = async () => {
    const missing: string[] = [];
    if (!profile.avatar_url) missing.push("a profile picture");
    if (!profile.cover_url) missing.push("a cover photo");
    if (!profile.full_name.trim()) missing.push("your full name");
    if (missing.length > 0) {
      setError(`Please add ${missing.join(", ")} before saving.`);
      return;
    }

    setSaving(true);
    setError("");
    const { error: saveError } = await supabase
      .from("business_profiles")
      .upsert(buildRow(), { onConflict: "card_id" });
    setSaving(false);
    if (saveError) {
      setError("Something went wrong saving your profile. Please try again.");
      return;
    }
    onModeChange("preview");
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
        profile={buildRow()}
        onBack={onBack}
        actionButtons={actionButtons}
      />
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-5">
      <SectionCard title="Photos">
        <FieldRow>
          <ImageUploadField
            label="Profile picture"
            cardId={cardId}
            folder="avatar"
            value={profile.avatar_url}
            onChange={(url) => update("avatar_url", url)}
            shape="square"
            required
          />
          <ImageUploadField
            label="Cover photo"
            cardId={cardId}
            folder="cover"
            value={profile.cover_url}
            onChange={(url) => update("cover_url", url)}
            shape="wide"
            required
          />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Basics">
        <FieldRow>
          <TextField
            label="Full name"
            value={profile.full_name}
            onChange={(v) => update("full_name", v)}
            placeholder="Jane Doe"
            required
          />
          <TextField
            label="Job title"
            value={profile.job_title}
            onChange={(v) => update("job_title", v)}
            placeholder="Founder, HERNEROS"
          />
        </FieldRow>
        <div>
          <label className="text-sm font-medium text-black">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={3}
            placeholder="A short intro about you"
            className="mt-1 w-full resize-none rounded-xl border border-black/15 p-4 text-sm outline-none focus:border-black"
          />
        </div>
        <TextField
          label="Email"
          type="email"
          value={profile.email}
          onChange={(v) => update("email", v)}
          placeholder="you@example.com"
        />
        <TagListInput
          label="Phone numbers"
          values={profile.phone_numbers}
          onChange={(v) => update("phone_numbers", v)}
          placeholder="+1 555 123 4567"
        />
      </SectionCard>

      <SectionCard title="Social networks">
        <SocialLinksEditor
          value={profile.social_links}
          onChange={(v) => update("social_links", v)}
        />
      </SectionCard>

      <SectionCard title="About you">
        <FieldRow>
          <TextField
            label="Current city"
            value={profile.current_city}
            onChange={(v) => update("current_city", v)}
          />
          <TextField
            label="Hometown"
            value={profile.hometown}
            onChange={(v) => update("hometown", v)}
          />
        </FieldRow>
        <FieldRow>
          <TextField
            label="Birthday"
            type="date"
            value={profile.birthday}
            onChange={(v) => update("birthday", v)}
          />
          <TextField
            label="Gender"
            value={profile.gender}
            onChange={(v) => update("gender", v)}
            placeholder="e.g. Woman, Man, Non-binary"
          />
        </FieldRow>
        <div className="min-w-0">
          <label className="text-sm font-medium text-black" htmlFor="relationship">
            Relationship status
          </label>
          <select
            id="relationship"
            value={profile.relationship_status}
            onChange={(e) => update("relationship_status", e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option || "Prefer not to say"}
              </option>
            ))}
          </select>
        </div>
        <TagListInput
          label="Languages"
          values={profile.languages}
          onChange={(v) => update("languages", v)}
          placeholder="English"
        />
      </SectionCard>

      <SectionCard title="Hobbies">
        <TagListInput
          label="Hobbies"
          values={profile.hobbies}
          onChange={(v) => update("hobbies", v)}
          placeholder="Photography"
        />
      </SectionCard>

      <SectionCard title="Interests">
        <FieldRow>
          <TagListInput
            label="Music"
            values={profile.interests.music}
            onChange={(v) => updateInterest("music", v)}
            placeholder="Jazz"
          />
          <TagListInput
            label="Movies"
            values={profile.interests.movies}
            onChange={(v) => updateInterest("movies", v)}
            placeholder="Sci-fi"
          />
        </FieldRow>
        <FieldRow>
          <TagListInput
            label="Games"
            values={profile.interests.games}
            onChange={(v) => updateInterest("games", v)}
            placeholder="Chess"
          />
          <TagListInput
            label="TV shows"
            values={profile.interests.tvShows}
            onChange={(v) => updateInterest("tvShows", v)}
            placeholder="Documentaries"
          />
        </FieldRow>
        <TagListInput
          label="Sports & athletes"
          values={profile.interests.sports}
          onChange={(v) => updateInterest("sports", v)}
          placeholder="Basketball"
        />
      </SectionCard>

      <SectionCard title="Work">
        <MultiEntryEditor
          label="Work experience"
          fields={[
            { key: "company", label: "Company" },
            { key: "title", label: "Role" },
            { key: "years", label: "Years", placeholder: "2020 – Present" },
          ]}
          value={profile.works}
          onChange={(v) => update("works", v)}
          addLabel="+ Add work"
        />
      </SectionCard>

      <SectionCard title="Education">
        <MultiEntryEditor
          label="Education"
          fields={[
            { key: "school", label: "School" },
            { key: "degree", label: "Degree" },
            { key: "years", label: "Years", placeholder: "2016 – 2020" },
          ]}
          value={profile.education}
          onChange={(v) => update("education", v)}
          addLabel="+ Add education"
        />
      </SectionCard>

      <SectionCard title="Travel">
        <TagListInput
          label="Places you've been"
          values={profile.travel_places}
          onChange={(v) => update("travel_places", v)}
          placeholder="Tokyo, Japan"
        />
      </SectionCard>

      <SectionCard title="Links">
        <MultiEntryEditor
          label="Other links"
          fields={[
            { key: "label", label: "Label", placeholder: "Portfolio" },
            { key: "url", label: "URL", placeholder: "https://" },
          ]}
          value={profile.links}
          onChange={(v) => update("links", v)}
          addLabel="+ Add link"
        />
      </SectionCard>

      {error && <p className="text-center text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="sticky bottom-4 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}
