import type { SocialLink } from "@/components/SocialLinksEditor";
import type { BusinessProfileRow } from "@/components/PublicProfileView";

export type SectionKey =
  | "contact"
  | "social"
  | "about"
  | "skills"
  | "hobbies"
  | "interests"
  | "work"
  | "education"
  | "travel"
  | "links";

export type ProfileState = {
  full_name: string;
  job_title: string;
  bio: string;
  avatar_url: string | null;
  cover_url: string | null;
  emails: string[];
  phone_numbers: string[];
  social_links: SocialLink[];
  skills: string[];
  hobbies: string[];
  relationship_status: string;
  current_city: string;
  hometown: string;
  birthday: string;
  age: string;
  gender: string;
  languages: string[];
  works: Record<string, string>[];
  education: Record<string, string>[];
  interests: string[];
  travel_places: string[];
  links: Record<string, string>[];
};

export const emptyProfile: ProfileState = {
  full_name: "",
  job_title: "",
  bio: "",
  avatar_url: null,
  cover_url: null,
  emails: [],
  phone_numbers: [],
  social_links: [],
  skills: [],
  hobbies: [],
  relationship_status: "",
  current_city: "",
  hometown: "",
  birthday: "",
  age: "",
  gender: "",
  languages: [],
  works: [],
  education: [],
  interests: [],
  travel_places: [],
  links: [],
};

export const RELATIONSHIP_OPTIONS = [
  "",
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "It's complicated",
  "Prefer not to say",
];

const LEGACY_INTEREST_GROUPS = ["music", "movies", "games", "tvShows", "sports"];

// Interests used to be stored as { music: [], movies: [], ... } instead of
// a flat list. Flatten any old-shape rows so existing users' data still shows up.
export function normalizeInterests(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return LEGACY_INTEREST_GROUPS.flatMap((key) =>
      Array.isArray(record[key]) ? (record[key] as string[]) : []
    );
  }
  return [];
}

export function profileFromRow(data: Record<string, unknown>): ProfileState {
  return {
    full_name: (data.full_name as string) ?? "",
    job_title: (data.job_title as string) ?? "",
    bio: (data.bio as string) ?? "",
    avatar_url: (data.avatar_url as string) ?? null,
    cover_url: (data.cover_url as string) ?? null,
    emails: (data.emails as string[]) ?? [],
    phone_numbers: (data.phone_numbers as string[]) ?? [],
    social_links: (data.social_links as SocialLink[]) ?? [],
    skills: (data.skills as string[]) ?? [],
    hobbies: (data.hobbies as string[]) ?? [],
    relationship_status: (data.relationship_status as string) ?? "",
    current_city: (data.current_city as string) ?? "",
    hometown: (data.hometown as string) ?? "",
    birthday: (data.birthday as string) ?? "",
    age: data.age != null ? String(data.age) : "",
    gender: (data.gender as string) ?? "",
    languages: (data.languages as string[]) ?? [],
    works: (data.works as Record<string, string>[]) ?? [],
    education: (data.education as Record<string, string>[]) ?? [],
    interests: normalizeInterests(data.interests),
    travel_places: (data.travel_places as string[]) ?? [],
    links: (data.links as Record<string, string>[]) ?? [],
  };
}

export function profileToRow(
  cardId: string,
  profile: ProfileState
): BusinessProfileRow {
  return {
    card_id: cardId,
    full_name: profile.full_name || null,
    job_title: profile.job_title || null,
    bio: profile.bio || null,
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
    emails: profile.emails,
    phone_numbers: profile.phone_numbers,
    social_links: profile.social_links,
    skills: profile.skills,
    hobbies: profile.hobbies,
    relationship_status: profile.relationship_status || null,
    current_city: profile.current_city || null,
    hometown: profile.hometown || null,
    birthday: profile.birthday || null,
    age: profile.age ? Number(profile.age) : null,
    gender: profile.gender || null,
    languages: profile.languages,
    works: profile.works,
    education: profile.education,
    interests: profile.interests,
    travel_places: profile.travel_places,
    links: profile.links,
  };
}
