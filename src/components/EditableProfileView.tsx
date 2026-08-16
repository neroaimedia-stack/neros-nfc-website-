"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBriefcase,
  FiBookOpen,
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
  FiHeart,
  FiInfo,
  FiLink,
  FiMapPin,
  FiPhone,
  FiStar,
} from "react-icons/fi";
import { findSocialPlatform } from "@/lib/social-platforms";
import { useImageUpload } from "@/lib/use-image-upload";
import {
  type Interests,
  type ProfileState,
  type SectionKey,
  RELATIONSHIP_OPTIONS,
} from "@/lib/business-profile";
import TagListInput from "@/components/TagListInput";
import SocialLinksEditor from "@/components/SocialLinksEditor";
import MultiEntryEditor from "@/components/MultiEntryEditor";
import FieldEditSheet from "@/components/FieldEditSheet";
import ImageCropModal from "@/components/ImageCropModal";

type SheetKey = SectionKey | "name" | "bio";

function PenIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

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

function EditBadge({
  onClick,
  className = "",
  label,
}: {
  onClick: () => void;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black ${className}`}
    >
      <PenIcon className="h-3.5 w-3.5" />
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

function MoveButtons({
  title,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: {
  title: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disableUp}
        aria-label={`Move ${title} up`}
        className="flex h-4 w-6 items-center justify-center text-black/30 hover:text-black disabled:opacity-20"
      >
        <FiChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        aria-label={`Move ${title} down`}
        className="flex h-4 w-6 items-center justify-center text-black/30 hover:text-black disabled:opacity-20"
      >
        <FiChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SectionRow({
  title,
  icon: Icon,
  onEdit,
  empty,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  children,
}: {
  title: string;
  icon: IconType;
  onEdit: () => void;
  empty: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/10 py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-black uppercase">
          <Icon className="h-4 w-4 shrink-0" />
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          <MoveButtons
            title={title}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            disableUp={disableUp}
            disableDown={disableDown}
          />
          <EditBadge onClick={onEdit} label={`Edit ${title}`} className="h-7 w-7 shrink-0" />
        </div>
      </div>
      <div className="mt-2">
        {empty ? (
          <p className="text-sm text-black/30">Not added yet</p>
        ) : (
          children
        )}
      </div>
    </div>
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

  const sections: {
    key: SectionKey;
    title: string;
    icon: IconType;
    empty: boolean;
    content: React.ReactNode;
  }[] = [
    {
      key: "contact",
      title: "Contact",
      icon: FiPhone,
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
      icon: FiGlobe,
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
      icon: FiInfo,
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
      icon: FiHeart,
      empty: profile.hobbies.length === 0,
      content: <ChipRow values={profile.hobbies} />,
    },
    {
      key: "interests",
      title: "Interests",
      icon: FiStar,
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
      icon: FiBriefcase,
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
      icon: FiBookOpen,
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
      icon: FiMapPin,
      empty: profile.travel_places.length === 0,
      content: <ChipRow values={profile.travel_places} />,
    },
    {
      key: "links",
      title: "Links",
      icon: FiLink,
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

  // Once the owner has customized the order, respect it exactly (they get
  // full control over sequencing). Until then, default to filled sections
  // first, with empty ones sinking to the bottom.
  const sectionsByKey = new Map(sections.map((s) => [s.key, s]));
  const orderedSections =
    profile.section_order.length > 0
      ? [
          ...profile.section_order
            .map((key) => sectionsByKey.get(key))
            .filter((s): s is (typeof sections)[number] => !!s),
          ...sections.filter((s) => !profile.section_order.includes(s.key)),
        ]
      : [...sections.filter((s) => !s.empty), ...sections.filter((s) => s.empty)];

  const moveSection = (key: SectionKey, direction: "up" | "down") => {
    const currentOrder = orderedSections.map((s) => s.key);
    const index = currentOrder.indexOf(key);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onSaveField({ ...profile, section_order: newOrder }).catch(() => {
      setImageError("Couldn't reorder sections. Please try again.");
    });
  };

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
        {onBack && <BackButton onClick={onBack} />}
        <button
          type="button"
          onClick={coverUpload.openFilePicker}
          aria-label="Edit cover photo"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity hover:opacity-70"
        >
          <PenIcon className="h-4 w-4" />
        </button>
        {coverUpload.hiddenInput}
      </div>

      <div className="px-6">
        <div className="flex items-end gap-3">
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
              className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black text-white transition-opacity hover:opacity-80"
            >
              <PenIcon className="h-3.5 w-3.5" />
            </button>
            {avatarUpload.hiddenInput}
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2 pt-3 pb-1">
            <div className="min-w-0">
              {profile.full_name ? (
                <h1 className="truncate text-3xl font-bold text-black">
                  {profile.full_name}
                </h1>
              ) : (
                <p className="text-3xl font-bold text-black/25">Add your name</p>
              )}
              {profile.job_title ? (
                <p className="truncate text-base font-medium text-black/60">{profile.job_title}</p>
              ) : (
                <p className="text-base font-medium text-black/25">Add a title</p>
              )}
            </div>
            <EditBadge
              onClick={() => openSheet("name")}
              label="Edit name & title"
              className="h-7 w-7 shrink-0"
            />
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {profile.bio ? (
              <p className="text-sm text-black/70">{profile.bio}</p>
            ) : (
              <p className="text-sm text-black/25">Add a bio</p>
            )}
          </div>
          <EditBadge
            onClick={() => openSheet("bio")}
            label="Edit bio"
            className="h-7 w-7 shrink-0"
          />
        </div>

        {(avatarUpload.error || coverUpload.error || imageError) && (
          <p className="mt-2 text-xs text-red-600">
            {avatarUpload.error || coverUpload.error || imageError}
          </p>
        )}

        {actionButtons && <div className="mt-3">{actionButtons}</div>}

        <div className="mt-3">
          {orderedSections.map((section, index) => (
            <SectionRow
              key={section.key}
              title={section.title}
              icon={section.icon}
              onEdit={() => openSheet(section.key)}
              empty={section.empty}
              onMoveUp={() => moveSection(section.key, "up")}
              onMoveDown={() => moveSection(section.key, "down")}
              disableUp={index === 0}
              disableDown={index === orderedSections.length - 1}
            >
              {section.content}
            </SectionRow>
          ))}
        </div>
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
