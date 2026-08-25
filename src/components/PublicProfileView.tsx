"use client";

import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiExternalLink,
  FiGlobe,
  FiHash,
  FiHeart,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { findSocialPlatform } from "@/lib/social-platforms";
import { sanitizeUrl } from "@/lib/sanitize";
import { normalizeInterests, type SectionKey } from "@/lib/business-profile";
import ExpandableList from "@/components/ExpandableList";
import ExpandableText from "@/components/ExpandableText";
import SaveContactButton from "@/components/SaveContactButton";

type SocialLink = { platform: string; url: string };
type Entry = Record<string, string>;

export type BusinessProfileRow = {
  card_id: string;
  full_name: string | null;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  emails: string[] | null;
  phone_numbers: string[] | null;
  social_links: SocialLink[] | null;
  skills: string[] | null;
  hobbies: string[] | null;
  relationship_status: string | null;
  current_city: string | null;
  hometown: string | null;
  birthday: string | null;
  age: number | null;
  gender: string | null;
  languages: string[] | null;
  works: Entry[] | null;
  education: Entry[] | null;
  interests: string[] | null;
  travel_places: string[] | null;
  links: Entry[] | null;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/10 py-3">
      <h2 className="text-sm font-bold tracking-wide text-black uppercase">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function formatBirthday(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
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

export default function PublicProfileView({
  profile,
  onBack,
  actionButtons,
  isOwnerPreview = false,
}: {
  profile: BusinessProfileRow;
  onBack?: () => void;
  actionButtons?: React.ReactNode;
  isOwnerPreview?: boolean;
}) {
  const socialLinks = (profile.social_links ?? []).filter((l) => l.url.trim());
  const works = (profile.works ?? []).filter((w) => w.company || w.title);
  const education = (profile.education ?? []).filter(
    (e) => e.school || e.degree || e.level
  );
  const links = (profile.links ?? []).filter((l) => l.url?.trim());
  const interests = normalizeInterests(profile.interests);
  const hasDetails =
    profile.current_city ||
    profile.hometown ||
    profile.birthday ||
    profile.age != null ||
    profile.gender ||
    profile.relationship_status ||
    (profile.languages && profile.languages.length > 0);

  const hasAnything =
    profile.full_name ||
    profile.job_title ||
    profile.bio ||
    (profile.emails && profile.emails.length > 0) ||
    (profile.phone_numbers && profile.phone_numbers.length > 0) ||
    socialLinks.length > 0 ||
    hasDetails ||
    (profile.skills && profile.skills.length > 0) ||
    (profile.hobbies && profile.hobbies.length > 0) ||
    interests.length > 0 ||
    works.length > 0 ||
    education.length > 0 ||
    (profile.travel_places && profile.travel_places.length > 0) ||
    links.length > 0;

  if (!hasAnything) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
        <p className="text-sm text-black/40">
          This profile hasn&apos;t been set up yet.
        </p>
        {actionButtons && <div className="mt-4">{actionButtons}</div>}
      </div>
    );
  }

  const sections: {
    key: SectionKey;
    title: string;
    empty: boolean;
    content: React.ReactNode;
  }[] = [
    {
      key: "contact",
      title: "Contact",
      empty:
        !(profile.emails && profile.emails.length > 0) &&
        !(profile.phone_numbers && profile.phone_numbers.length > 0),
      content: (
        <div className="flex flex-col gap-2 text-sm">
          {(profile.emails ?? []).map((email) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
            >
              <FiMail className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{email}</span>
            </a>
          ))}
          {(profile.phone_numbers ?? []).map((phone) => (
            <a
              key={phone}
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
            >
              <FiPhone className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{phone}</span>
            </a>
          ))}
        </div>
      ),
    },
    {
      key: "social",
      title: "Social networks",
      empty: socialLinks.length === 0,
      content: (
        <ExpandableList
          items={socialLinks}
          max={5}
          className="flex flex-col gap-3"
          renderItem={(link) => {
            const platform = findSocialPlatform(link.platform);
            if (!platform) return null;
            const safeUrl = sanitizeUrl(link.url);
            if (!safeUrl) return null;
            const Icon = platform.Icon;
            return (
              <a
                key={link.platform}
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-opacity hover:opacity-60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-black">{platform.label}</span>
              </a>
            );
          }}
        />
      ),
    },
    {
      key: "about",
      title: "About",
      empty: !hasDetails,
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
              <dd className="font-medium">{formatBirthday(profile.birthday)}</dd>
            </div>
          )}
          {profile.age != null && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-black/50">
                <FiHash className="h-4 w-4 shrink-0" />
                Age
              </dt>
              <dd className="font-medium">{profile.age}</dd>
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
          {profile.languages && profile.languages.length > 0 && (
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
      key: "skills",
      title: "Skills",
      empty: !profile.skills || profile.skills.length === 0,
      content: (
        <ExpandableList
          items={profile.skills ?? []}
          max={5}
          className="flex flex-col gap-2 text-sm"
          renderItem={(skill) => (
            <div key={skill} className="flex items-center gap-1.5">
              <FiAward className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{skill}</span>
            </div>
          )}
        />
      ),
    },
    {
      key: "hobbies",
      title: "Hobbies",
      empty: !profile.hobbies || profile.hobbies.length === 0,
      content: (
        <ExpandableList
          items={profile.hobbies ?? []}
          max={5}
          className="flex flex-col gap-2 text-sm"
          renderItem={(hobby) => (
            <div key={hobby} className="flex items-center gap-1.5">
              <FiStar className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{hobby}</span>
            </div>
          )}
        />
      ),
    },
    {
      key: "interests",
      title: "Interests",
      empty: interests.length === 0,
      content: (
        <ExpandableList
          items={interests}
          max={5}
          className="flex flex-col gap-2 text-sm"
          renderItem={(interest) => (
            <div key={interest} className="flex items-center gap-1.5">
              <FiHeart className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{interest}</span>
            </div>
          )}
        />
      ),
    },
    {
      key: "work",
      title: "Work",
      empty: works.length === 0,
      content: (
        <ExpandableList
          items={works}
          max={4}
          className="flex flex-col gap-3"
          renderItem={(entry, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <FiBriefcase className="mt-0.5 h-4 w-4 shrink-0 text-black/50" />
              <div>
                <p className="font-semibold text-black">
                  {[entry.title, entry.company].filter(Boolean).join(" at ")}
                </p>
                {entry.years && <p className="text-black/40">{entry.years}</p>}
              </div>
            </div>
          )}
        />
      ),
    },
    {
      key: "education",
      title: "Education",
      empty: education.length === 0,
      content: (
        <ExpandableList
          items={education}
          max={4}
          className="flex flex-col gap-3"
          renderItem={(entry, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <FiBookOpen className="mt-0.5 h-4 w-4 shrink-0 text-black/50" />
              <div>
                <p className="font-semibold text-black">
                  {[entry.level, entry.degree, entry.school].filter(Boolean).join(" · ")}
                </p>
                {entry.years && <p className="text-black/40">{entry.years}</p>}
              </div>
            </div>
          )}
        />
      ),
    },
    {
      key: "travel",
      title: "Places been to",
      empty: !profile.travel_places || profile.travel_places.length === 0,
      content: (
        <ExpandableList
          items={profile.travel_places ?? []}
          max={5}
          className="flex flex-col gap-2 text-sm"
          renderItem={(place) => (
            <div key={place} className="flex items-center gap-1.5">
              <FiMapPin className="h-4 w-4 shrink-0 text-black/50" />
              <span className="font-medium text-black">{place}</span>
            </div>
          )}
        />
      ),
    },
    {
      key: "links",
      title: "Links",
      empty: links.length === 0,
      content: (
        <ExpandableList
          items={links}
          max={5}
          className="flex flex-col gap-2 text-sm"
          renderItem={(link, i) => {
            const safeUrl = sanitizeUrl(link.url ?? "");
            if (!safeUrl) return null;
            return (
              <a
                key={i}
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
              >
                <FiExternalLink className="h-4 w-4 shrink-0 text-black/50" />
                <span className="font-semibold text-black">{link.label || link.url}</span>
              </a>
            );
          }}
        />
      ),
    },
  ];

  const orderedSections = sections.filter((s) => !s.empty);

  return (
    <div className="mx-auto w-full max-w-md pb-16 md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
      <div className="relative">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt=""
            className="h-36 w-full object-cover md:h-48 lg:h-56"
          />
        ) : (
          <div className="h-36 w-full bg-black/5 md:h-48 lg:h-56" />
        )}
        {onBack && <BackButton onClick={onBack} />}
      </div>

      <div className="px-6 md:px-8">
        <div className="flex items-end gap-3">
          <div className="relative z-10 -mt-12 shrink-0 md:-mt-14 lg:-mt-16">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? "Profile picture"}
                className="h-24 w-24 rounded-full border-4 border-white object-cover object-top md:h-28 md:w-28 lg:h-32 lg:w-32"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-black/10 md:h-28 md:w-28 lg:h-32 lg:w-32" />
            )}
          </div>
          <div className="min-w-0 pt-3 pb-1">
            {profile.full_name && (
              <h1 className="line-clamp-2 text-2xl font-bold break-words text-black sm:text-3xl md:text-4xl">
                {profile.full_name}
              </h1>
            )}
            {profile.job_title && (
              <p className="line-clamp-2 text-sm font-medium break-words text-black/80 sm:text-base md:text-lg">
                {profile.job_title}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <ExpandableText
            text={profile.bio}
            max={140}
            className="mt-3 text-sm text-black/80"
          />
        )}

        {!isOwnerPreview && (
          <SaveContactButton
            profile={profile}
            className="mt-3 block w-full rounded-full bg-black px-6 py-2 text-center text-sm font-semibold text-white transition-opacity hover:opacity-80"
          />
        )}

        {actionButtons && <div className="mt-3">{actionButtons}</div>}
      </div>

      <div className="mt-3 flex flex-col px-6">
        {orderedSections.map((section) => (
          <Section key={section.key} title={section.title}>
            {section.content}
          </Section>
        ))}
      </div>
    </div>
  );
}
