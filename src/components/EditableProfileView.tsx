"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiExternalLink,
  FiFilm,
  FiGlobe,
  FiHeart,
  FiMail,
  FiMapPin,
  FiMusic,
  FiPhone,
  FiStar,
  FiTarget,
  FiTv,
  FiUser,
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
    <div className="border-b border-black/10 py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-wide text-black uppercase">{title}</h2>
        <EditBadge onClick={onEdit} label={`Edit ${title}`} className="h-7 w-7 shrink-0" />
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
  const education = profile.education.filter((e) => e.school || e.degree || e.level);
  const links = profile.links.filter((l) => l.url?.trim());
  const interestGroups: { label: string; icon: IconType; values: string[] }[] = [
    { label: "Music", icon: FiMusic, values: profile.interests.music },
    { label: "Movies", icon: FiFilm, values: profile.interests.movies },
    { label: "Games", icon: FiTarget, values: profile.interests.games },
    { label: "TV shows", icon: FiTv, values: profile.interests.tvShows },
    { label: "Sports & athletes", icon: FiActivity, values: profile.interests.sports },
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
    empty: boolean;
    content: React.ReactNode;
  }[] = [
    {
      key: "contact",
      title: "Contact",
      empty: profile.emails.length === 0 && profile.phone_numbers.length === 0,
      content: (
        <div className="flex flex-col gap-2 text-sm">
          {profile.emails.map((email) => (
            <div key={email} className="flex items-center gap-1.5">
              <FiMail className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{email}</span>
            </div>
          ))}
          {profile.phone_numbers.map((phone) => (
            <div key={phone} className="flex items-center gap-1.5">
              <FiPhone className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{phone}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "social",
      title: "Social networks",
      empty: socialLinks.length === 0,
      content: (
        <div className="flex flex-col gap-3">
          {socialLinks.map((link) => {
            const platform = findSocialPlatform(link.platform);
            if (!platform) return null;
            const Icon = platform.Icon;
            return (
              <div key={link.platform} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-black">{platform.label}</span>
              </div>
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
        <dl className="flex flex-col gap-2 text-sm text-black">
          {(profile.current_city || profile.hometown) && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiMapPin className="h-4 w-4 shrink-0" />
                Location
              </dt>
              <dd className="text-right font-medium">
                {[profile.current_city, profile.hometown && `from ${profile.hometown}`]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
          )}
          {profile.birthday && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiCalendar className="h-4 w-4 shrink-0" />
                Birthday
              </dt>
              <dd className="font-medium">
                {new Date(`${profile.birthday}T00:00:00`).toLocaleDateString(
                  undefined,
                  { month: "long", day: "numeric" }
                )}
              </dd>
            </div>
          )}
          {profile.gender && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiUser className="h-4 w-4 shrink-0" />
                Gender
              </dt>
              <dd className="font-medium">{profile.gender}</dd>
            </div>
          )}
          {profile.relationship_status && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiHeart className="h-4 w-4 shrink-0" />
                Relationship
              </dt>
              <dd className="font-medium">{profile.relationship_status}</dd>
            </div>
          )}
          {profile.languages.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiGlobe className="h-4 w-4 shrink-0" />
                Languages
              </dt>
              <dd className="text-right font-medium">{profile.languages.join(", ")}</dd>
            </div>
          )}
        </dl>
      ),
    },
    {
      key: "hobbies",
      title: "Hobbies",
      empty: profile.hobbies.length === 0,
      content: (
        <div className="flex flex-col gap-2 text-sm">
          {profile.hobbies.map((hobby) => (
            <div key={hobby} className="flex items-center gap-1.5">
              <FiStar className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{hobby}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "interests",
      title: "Interests",
      empty: interestGroups.length === 0,
      content: (
        <div className="flex flex-col gap-3">
          {interestGroups.map((group) => (
            <div key={group.label}>
              <p className="flex items-center gap-1.5 text-xs font-medium text-black/50">
                <group.icon className="h-3.5 w-3.5 shrink-0" />
                {group.label}
              </p>
              <div className="mt-1.5 flex flex-col gap-1.5 pl-5 text-sm">
                {group.values.map((v) => (
                  <span key={v} className="font-medium text-black">
                    {v}
                  </span>
                ))}
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
            <div key={i} className="flex items-start gap-2 text-sm">
              <FiBriefcase className="mt-0.5 h-4 w-4 shrink-0 text-black/50" />
              <div>
                <p className="font-semibold text-black">
                  {[entry.title, entry.company].filter(Boolean).join(" at ")}
                </p>
                {entry.years && <p className="text-black/40">{entry.years}</p>}
              </div>
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
            <div key={i} className="flex items-start gap-2 text-sm">
              <FiBookOpen className="mt-0.5 h-4 w-4 shrink-0 text-black/50" />
              <div>
                <p className="font-semibold text-black">
                  {[entry.level, entry.degree, entry.school].filter(Boolean).join(" · ")}
                </p>
                {entry.years && <p className="text-black/40">{entry.years}</p>}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "travel",
      title: "Places been to",
      empty: profile.travel_places.length === 0,
      content: (
        <div className="flex flex-col gap-2 text-sm">
          {profile.travel_places.map((place) => (
            <div key={place} className="flex items-center gap-1.5">
              <FiMapPin className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{place}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "links",
      title: "Links",
      empty: links.length === 0,
      content: (
        <div className="flex flex-col gap-2 text-sm">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <FiExternalLink className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-semibold text-black">{link.label || link.url}</span>
            </div>
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
                <p className="truncate text-base font-medium text-black/80">{profile.job_title}</p>
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
              <p className="text-sm text-black/80">{profile.bio}</p>
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
          <TagListInput
            label="Emails"
            values={draft.emails}
            onChange={(v) => updateDraft("emails", v)}
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
              {
                key: "level",
                label: "Level",
                options: [
                  "Preschool/Kindergarten",
                  "Elementary",
                  "Junior high school",
                  "Senior high school",
                  "Vocational/Technical",
                  "College/Undergraduate",
                  "Postgraduate (Master's)",
                  "Doctorate (PhD)",
                ],
              },
              { key: "school", label: "School" },
              { key: "degree", label: "Degree" },
              { key: "years", label: "Years", placeholder: "2016 – 2020 or Ongoing" },
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
