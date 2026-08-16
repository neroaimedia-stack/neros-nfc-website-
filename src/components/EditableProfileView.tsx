"use client";

import { useState } from "react";
import { findSocialPlatform } from "@/lib/social-platforms";
import { useImageUpload } from "@/lib/use-image-upload";
import {
  type Interests,
  type ProfileState,
  RELATIONSHIP_OPTIONS,
} from "@/lib/business-profile";
import TagListInput from "@/components/TagListInput";
import SocialLinksEditor from "@/components/SocialLinksEditor";
import MultiEntryEditor from "@/components/MultiEntryEditor";
import FieldEditSheet from "@/components/FieldEditSheet";
import ImageCropModal from "@/components/ImageCropModal";

type SheetKey =
  | "name"
  | "bio"
  | "contact"
  | "social"
  | "about"
  | "hobbies"
  | "interests"
  | "work"
  | "education"
  | "travel"
  | "links";

function BackButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Back"
      className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity hover:opacity-70"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

function ChipRow({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-black"
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function SectionRow({
  title,
  onEdit,
  empty,
  children,
}: {
  title: string;
  onEdit: () => void;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="block w-full border-t border-black/10 py-5 text-left"
    >
      <h2
        className={`text-xs font-bold tracking-wide uppercase ${
          empty ? "text-black/25" : "text-black/40"
        }`}
      >
        {title}
      </h2>
      {!empty && <div className="mt-3">{children}</div>}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="text-sm font-medium text-black">{label}</label>
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

export default function EditableProfileView({
  cardId,
  profile,
  onSaveField,
  onBack,
  actionButtons,
}: {
  cardId: string;
  profile: ProfileState;
  onSaveField: (next: ProfileState) => Promise<void>;
  onBack?: () => void;
  actionButtons?: React.ReactNode;
}) {
  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);
  const [draft, setDraft] = useState<ProfileState>(profile);
  const [savingSheet, setSavingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [imageError, setImageError] = useState("");

  const openSheet = (key: SheetKey) => {
    setDraft(profile);
    setSheetError("");
    setActiveSheet(key);
  };
  const closeSheet = () => setActiveSheet(null);

  const updateDraft = <K extends keyof ProfileState>(
    key: K,
    value: ProfileState[K]
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const updateDraftInterest = (key: keyof Interests, value: string[]) =>
    setDraft((prev) => ({
      ...prev,
      interests: { ...prev.interests, [key]: value },
    }));

  const handleSheetSave = async () => {
    setSavingSheet(true);
    setSheetError("");
    try {
      await onSaveField(draft);
      setActiveSheet(null);
    } catch {
      setSheetError("Something went wrong saving. Please try again.");
    }
    setSavingSheet(false);
  };

  const avatarUpload = useImageUpload({
    cardId,
    folder: "avatar",
    onChange: async (url) => {
      setImageError("");
      try {
        await onSaveField({ ...profile, avatar_url: url });
      } catch {
        setImageError("Couldn't save your profile picture. Please try again.");
      }
    },
  });

  const coverUpload = useImageUpload({
    cardId,
    folder: "cover",
    onChange: async (url) => {
      setImageError("");
      try {
        await onSaveField({ ...profile, cover_url: url });
      } catch {
        setImageError("Couldn't save your cover photo. Please try again.");
      }
    },
  });

  const socialLinks = profile.social_links.filter((l) => l.url.trim());
  const works = profile.works.filter((w) => w.company || w.title);
  const education = profile.education.filter((e) => e.school || e.degree);
  const links = profile.links.filter((l) => l.url?.trim());
  const interestGroups: { label: string; values: string[] }[] = [
    { label: "Music", values: profile.interests.music },
    { label: "Movies", values: profile.interests.movies },
    { label: "Games", values: profile.interests.games },
    { label: "TV shows", values: profile.interests.tvShows },
    { label: "Sports & athletes", values: profile.interests.sports },
  ].filter((g) => g.values.length > 0);
  const hasAbout =
    !!profile.current_city ||
    !!profile.hometown ||
    !!profile.birthday ||
    !!profile.gender ||
    !!profile.relationship_status ||
    profile.languages.length > 0;

  const sections: { key: SheetKey; title: string; empty: boolean; content: React.ReactNode }[] = [
    {
      key: "contact",
      title: "Contact",
      empty: !profile.email && profile.phone_numbers.length === 0,
      content: (
        <div className="flex flex-wrap gap-2">
          {profile.email && (
            <span className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-black">
              {profile.email}
            </span>
          )}
          {profile.phone_numbers.map((phone) => (
            <span
              key={phone}
              className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-black"
            >
              {phone}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "social",
      title: "Social networks",
      empty: socialLinks.length === 0,
      content: (
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((link) => {
            const platform = findSocialPlatform(link.platform);
            if (!platform) return null;
            const Icon = platform.Icon;
            return (
              <span
                key={link.platform}
                title={platform.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black"
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: "about",
      title: "About",
      empty: !hasAbout,
      content: (
        <dl className="flex flex-col gap-2 text-sm text-black/70">
          {(profile.current_city || profile.hometown) && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/40">Location</dt>
              <dd className="text-right">
                {[profile.current_city, profile.hometown && `from ${profile.hometown}`]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
          )}
          {profile.birthday && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/40">Birthday</dt>
              <dd>
                {new Date(`${profile.birthday}T00:00:00`).toLocaleDateString(
                  undefined,
                  { month: "long", day: "numeric" }
                )}
              </dd>
            </div>
          )}
          {profile.gender && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/40">Gender</dt>
              <dd>{profile.gender}</dd>
            </div>
          )}
          {profile.relationship_status && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/40">Relationship</dt>
              <dd>{profile.relationship_status}</dd>
            </div>
          )}
          {profile.languages.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/40">Languages</dt>
              <dd className="text-right">{profile.languages.join(", ")}</dd>
            </div>
          )}
        </dl>
      ),
    },
    {
      key: "hobbies",
      title: "Hobbies",
      empty: profile.hobbies.length === 0,
      content: <ChipRow values={profile.hobbies} />,
    },
    {
      key: "interests",
      title: "Interests",
      empty: interestGroups.length === 0,
      content: (
        <div className="flex flex-col gap-3">
          {interestGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-black/50">{group.label}</p>
              <div className="mt-1.5">
                <ChipRow values={group.values} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "work",
      title: "Work",
      empty: works.length === 0,
      content: (
        <div className="flex flex-col gap-3">
          {works.map((entry, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold text-black">
                {[entry.title, entry.company].filter(Boolean).join(" at ")}
              </p>
              {entry.years && <p className="text-black/40">{entry.years}</p>}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "education",
      title: "Education",
      empty: education.length === 0,
      content: (
        <div className="flex flex-col gap-3">
          {education.map((entry, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold text-black">
                {[entry.degree, entry.school].filter(Boolean).join(" · ")}
              </p>
              {entry.years && <p className="text-black/40">{entry.years}</p>}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "travel",
      title: "Places been to",
      empty: profile.travel_places.length === 0,
      content: <ChipRow values={profile.travel_places} />,
    },
    {
      key: "links",
      title: "Links",
      empty: links.length === 0,
      content: (
        <div className="flex flex-col gap-2">
          {links.map((link, i) => (
            <span key={i} className="block text-sm font-semibold text-black">
              {link.label || link.url}
            </span>
          ))}
        </div>
      ),
    },
  ];

  // Filled sections first (in their normal order), empty ones sink to the
  // bottom so the profile reads cleanly without needing to fill everything.
  const orderedSections = [
    ...sections.filter((s) => !s.empty),
    ...sections.filter((s) => s.empty),
  ];

  return (
    <div className="mx-auto w-full max-w-md pb-16">
      <div className="relative">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt=""
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="h-36 w-full bg-black/5" />
        )}
        <button
          type="button"
          onClick={coverUpload.openFilePicker}
          aria-label="Edit cover photo"
          className="absolute inset-0"
        />
        {onBack && <BackButton onClick={onBack} />}
        {coverUpload.hiddenInput}
      </div>

      <div className="px-6">
        <div className="flex items-end gap-4">
          <div className="relative z-10 -mt-12 shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Profile picture"}
                className="h-24 w-24 rounded-full border-4 border-white object-cover object-top"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-black/10" />
            )}
            <button
              type="button"
              onClick={avatarUpload.openFilePicker}
              aria-label="Edit profile picture"
              className="absolute inset-0 rounded-full"
            />
            {avatarUpload.hiddenInput}
          </div>
          <button
            type="button"
            onClick={() => openSheet("name")}
            className="min-w-0 flex-1 pt-3 pb-1 text-left"
          >
            {profile.full_name ? (
              <h1 className="truncate text-2xl font-bold text-black">
                {profile.full_name}
              </h1>
            ) : (
              <p className="text-2xl font-bold text-black/25">Add your name</p>
            )}
            {profile.job_title ? (
              <p className="truncate text-sm text-black/60">{profile.job_title}</p>
            ) : (
              <p className="text-sm text-black/25">Add a title</p>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => openSheet("bio")}
          className="mt-4 block w-full text-left"
        >
          {profile.bio ? (
            <p className="text-sm text-black/70">{profile.bio}</p>
          ) : (
            <p className="text-sm text-black/25">Add a bio</p>
          )}
        </button>

        {(avatarUpload.error || coverUpload.error || imageError) && (
          <p className="mt-2 text-xs text-red-600">
            {avatarUpload.error || coverUpload.error || imageError}
          </p>
        )}

        {actionButtons && <div className="mt-4">{actionButtons}</div>}

        {orderedSections.map((section) => (
          <SectionRow
            key={section.key}
            title={section.title}
            onEdit={() => openSheet(section.key)}
            empty={section.empty}
          >
            {section.content}
          </SectionRow>
        ))}
      </div>

      {avatarUpload.pendingImageSrc && (
        <ImageCropModal
          imageSrc={avatarUpload.pendingImageSrc}
          aspect={1}
          cropShape="round"
          onCancel={avatarUpload.closeCropper}
          onConfirm={avatarUpload.handleCropConfirm}
        />
      )}
      {coverUpload.pendingImageSrc && (
        <ImageCropModal
          imageSrc={coverUpload.pendingImageSrc}
          aspect={3}
          cropShape="rect"
          onCancel={coverUpload.closeCropper}
          onConfirm={coverUpload.handleCropConfirm}
        />
      )}

      {activeSheet === "name" && (
        <FieldEditSheet
          title="Name & title"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TextField
            label="Full name"
            value={draft.full_name}
            onChange={(v) => updateDraft("full_name", v)}
            placeholder="Jane Doe"
          />
          <TextField
            label="Job title"
            value={draft.job_title}
            onChange={(v) => updateDraft("job_title", v)}
            placeholder="Founder, HERNEROS"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "bio" && (
        <FieldEditSheet
          title="Bio"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <textarea
            value={draft.bio}
            onChange={(e) => updateDraft("bio", e.target.value)}
            rows={4}
            placeholder="A short intro about you"
            className="w-full resize-none rounded-xl border border-black/15 p-4 text-sm outline-none focus:border-black"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "contact" && (
        <FieldEditSheet
          title="Contact"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TextField
            label="Email"
            type="email"
            value={draft.email}
            onChange={(v) => updateDraft("email", v)}
            placeholder="you@example.com"
          />
          <TagListInput
            label="Phone numbers"
            values={draft.phone_numbers}
            onChange={(v) => updateDraft("phone_numbers", v)}
            placeholder="+1 555 123 4567"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "social" && (
        <FieldEditSheet
          title="Social networks"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <SocialLinksEditor
            value={draft.social_links}
            onChange={(v) => updateDraft("social_links", v)}
          />
        </FieldEditSheet>
      )}

      {activeSheet === "about" && (
        <FieldEditSheet
          title="About"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TextField
            label="Current city"
            value={draft.current_city}
            onChange={(v) => updateDraft("current_city", v)}
          />
          <TextField
            label="Hometown"
            value={draft.hometown}
            onChange={(v) => updateDraft("hometown", v)}
          />
          <TextField
            label="Birthday"
            type="date"
            value={draft.birthday}
            onChange={(v) => updateDraft("birthday", v)}
          />
          <TextField
            label="Gender"
            value={draft.gender}
            onChange={(v) => updateDraft("gender", v)}
            placeholder="e.g. Woman, Man, Non-binary"
          />
          <div>
            <label className="text-sm font-medium text-black" htmlFor="relationship">
              Relationship status
            </label>
            <select
              id="relationship"
              value={draft.relationship_status}
              onChange={(e) => updateDraft("relationship_status", e.target.value)}
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
            values={draft.languages}
            onChange={(v) => updateDraft("languages", v)}
            placeholder="English"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "hobbies" && (
        <FieldEditSheet
          title="Hobbies"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TagListInput
            label="Hobbies"
            values={draft.hobbies}
            onChange={(v) => updateDraft("hobbies", v)}
            placeholder="Photography"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "interests" && (
        <FieldEditSheet
          title="Interests"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TagListInput
            label="Music"
            values={draft.interests.music}
            onChange={(v) => updateDraftInterest("music", v)}
            placeholder="Jazz"
          />
          <TagListInput
            label="Movies"
            values={draft.interests.movies}
            onChange={(v) => updateDraftInterest("movies", v)}
            placeholder="Sci-fi"
          />
          <TagListInput
            label="Games"
            values={draft.interests.games}
            onChange={(v) => updateDraftInterest("games", v)}
            placeholder="Chess"
          />
          <TagListInput
            label="TV shows"
            values={draft.interests.tvShows}
            onChange={(v) => updateDraftInterest("tvShows", v)}
            placeholder="Documentaries"
          />
          <TagListInput
            label="Sports & athletes"
            values={draft.interests.sports}
            onChange={(v) => updateDraftInterest("sports", v)}
            placeholder="Basketball"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "work" && (
        <FieldEditSheet
          title="Work"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <MultiEntryEditor
            label="Work experience"
            fields={[
              { key: "company", label: "Company" },
              { key: "title", label: "Role" },
              { key: "years", label: "Years", placeholder: "2020 – Present" },
            ]}
            value={draft.works}
            onChange={(v) => updateDraft("works", v)}
            addLabel="+ Add work"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "education" && (
        <FieldEditSheet
          title="Education"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <MultiEntryEditor
            label="Education"
            fields={[
              { key: "school", label: "School" },
              { key: "degree", label: "Degree" },
              { key: "years", label: "Years", placeholder: "2016 – 2020" },
            ]}
            value={draft.education}
            onChange={(v) => updateDraft("education", v)}
            addLabel="+ Add education"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "travel" && (
        <FieldEditSheet
          title="Places been to"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <TagListInput
            label="Places you've been"
            values={draft.travel_places}
            onChange={(v) => updateDraft("travel_places", v)}
            placeholder="Tokyo, Japan"
          />
        </FieldEditSheet>
      )}

      {activeSheet === "links" && (
        <FieldEditSheet
          title="Links"
          onCancel={closeSheet}
          onSave={handleSheetSave}
          saving={savingSheet}
          error={sheetError}
        >
          <MultiEntryEditor
            label="Other links"
            fields={[
              { key: "label", label: "Label", placeholder: "Portfolio" },
              { key: "url", label: "URL", placeholder: "https://" },
            ]}
            value={draft.links}
            onChange={(v) => updateDraft("links", v)}
            addLabel="+ Add link"
          />
        </FieldEditSheet>
      )}
    </div>
  );
}
