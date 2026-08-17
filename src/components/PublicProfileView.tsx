import { FiCalendar, FiGlobe, FiHeart, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { findSocialPlatform } from "@/lib/social-platforms";
import type { SectionKey } from "@/lib/business-profile";

type SocialLink = { platform: string; url: string };
type Entry = Record<string, string>;
type Interests = {
  music?: string[];
  movies?: string[];
  games?: string[];
  tvShows?: string[];
  sports?: string[];
};

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
  hobbies: string[] | null;
  relationship_status: string | null;
  current_city: string | null;
  hometown: string | null;
  birthday: string | null;
  gender: string | null;
  languages: string[] | null;
  works: Entry[] | null;
  education: Entry[] | null;
  interests: Interests | null;
  travel_places: string[] | null;
  links: Entry[] | null;
};

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
}: {
  profile: BusinessProfileRow;
  onBack?: () => void;
  actionButtons?: React.ReactNode;
}) {
  const socialLinks = (profile.social_links ?? []).filter((l) => l.url.trim());
  const works = (profile.works ?? []).filter((w) => w.company || w.title);
  const education = (profile.education ?? []).filter(
    (e) => e.school || e.degree || e.level
  );
  const links = (profile.links ?? []).filter((l) => l.url?.trim());
  const interests = profile.interests ?? {};
  const interestGroups: { label: string; values: string[] }[] = [
    { label: "Music", values: interests.music ?? [] },
    { label: "Movies", values: interests.movies ?? [] },
    { label: "Games", values: interests.games ?? [] },
    { label: "TV shows", values: interests.tvShows ?? [] },
    { label: "Sports & athletes", values: interests.sports ?? [] },
  ].filter((g) => g.values.length > 0);

  const hasDetails =
    profile.current_city ||
    profile.hometown ||
    profile.birthday ||
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
    (profile.hobbies && profile.hobbies.length > 0) ||
    interestGroups.length > 0 ||
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
        <div className="flex flex-col gap-3">
          {socialLinks.map((link) => {
            const platform = findSocialPlatform(link.platform);
            if (!platform) return null;
            const Icon = platform.Icon;
            return (
              <a
                key={link.platform}
                href={link.url}
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
          })}
        </div>
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
      key: "hobbies",
      title: "Hobbies",
      empty: !profile.hobbies || profile.hobbies.length === 0,
      content: <ChipRow values={profile.hobbies ?? []} />,
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
                {[entry.level, entry.degree, entry.school].filter(Boolean).join(" · ")}
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
      empty: !profile.travel_places || profile.travel_places.length === 0,
      content: <ChipRow values={profile.travel_places ?? []} />,
    },
    {
      key: "links",
      title: "Links",
      empty: links.length === 0,
      content: (
        <div className="flex flex-col gap-2">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-black underline underline-offset-2 hover:opacity-60"
            >
              {link.label || link.url}
            </a>
          ))}
        </div>
      ),
    },
  ];

  const orderedSections = sections.filter((s) => !s.empty);

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
      </div>

      <div className="px-6">
        <div className="flex items-end gap-3">
          <div className="relative z-10 -mt-12 shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name ?? "Profile picture"}
                className="h-24 w-24 rounded-full border-4 border-white object-cover object-top"
              />
            ) : (
              <div className="h-24 w-24 rounded-full border-4 border-white bg-black/10" />
            )}
          </div>
          <div className="min-w-0 pt-3 pb-1">
            {profile.full_name && (
              <h1 className="truncate text-3xl font-bold text-black">
                {profile.full_name}
              </h1>
            )}
            {profile.job_title && (
              <p className="truncate text-base font-medium text-black/80">{profile.job_title}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-sm text-black/80">{profile.bio}</p>
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
