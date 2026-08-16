import { findSocialPlatform } from "@/lib/social-platforms";

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
  email: string | null;
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
    <div className="border-t border-black/10 pt-6">
      <h2 className="text-xs font-bold tracking-wide text-black/40 uppercase">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
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
  const education = (profile.education ?? []).filter((e) => e.school || e.degree);
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
    profile.email ||
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
        <div className="flex items-end gap-4">
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
              <h1 className="truncate text-2xl font-bold text-black">
                {profile.full_name}
              </h1>
            )}
            {profile.job_title && (
              <p className="truncate text-sm text-black/60">{profile.job_title}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-black/70">{profile.bio}</p>
        )}

        {actionButtons && <div className="mt-4">{actionButtons}</div>}

        {(profile.email || (profile.phone_numbers && profile.phone_numbers.length > 0)) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-60"
              >
                Email
              </a>
            )}
            {(profile.phone_numbers ?? []).map((phone) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className="rounded-full border border-black px-4 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-60"
              >
                {phone}
              </a>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
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
                  title={platform.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black transition-opacity hover:opacity-60"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6 px-6">
        {hasDetails && (
          <Section title="About">
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
                  <dd>{formatBirthday(profile.birthday)}</dd>
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
              {profile.languages && profile.languages.length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-black/40">Languages</dt>
                  <dd className="text-right">{profile.languages.join(", ")}</dd>
                </div>
              )}
            </dl>
          </Section>
        )}

        {profile.hobbies && profile.hobbies.length > 0 && (
          <Section title="Hobbies">
            <ChipRow values={profile.hobbies} />
          </Section>
        )}

        {interestGroups.length > 0 && (
          <Section title="Interests">
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
          </Section>
        )}

        {works.length > 0 && (
          <Section title="Work">
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
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education">
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
          </Section>
        )}

        {profile.travel_places && profile.travel_places.length > 0 && (
          <Section title="Places been to">
            <ChipRow values={profile.travel_places} />
          </Section>
        )}

        {links.length > 0 && (
          <Section title="Links">
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
          </Section>
        )}
      </div>
    </div>
  );
}
