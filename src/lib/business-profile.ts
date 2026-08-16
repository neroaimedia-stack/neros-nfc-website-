import type { SocialLink } from "@/components/SocialLinksEditor";
import type { BusinessProfileRow } from "@/components/PublicProfileView";

export type SectionKey =
  | "contact"
  | "social"
  | "about"
  | "hobbies"
  | "interests"
  | "work"
  | "education"
  | "travel"
  | "links";

export type Interests = {
  music: string[];
  movies: string[];
  games: string[];
  tvShows: string[];
  sports: string[];
};

export const emptyInterests: Interests = {
  music: [],
  movies: [],
  games: [],
  tvShows: [],
  sports: [],
};

export type ProfileState = {
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

export const emptyProfile: ProfileState = {
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

export const RELATIONSHIP_OPTIONS = [
  "",
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "It's complicated",
  "Prefer not to say",
];

export function profileFromRow(data: Record<string, unknown>): ProfileState {
  return {
    full_name: (data.full_name as string) ?? "",
    job_title: (data.job_title as string) ?? "",
    bio: (data.bio as string) ?? "",
    avatar_url: (data.avatar_url as string) ?? null,
    cover_url: (data.cover_url as string) ?? null,
    email: (data.email as string) ?? "",
    phone_numbers: (data.phone_numbers as string[]) ?? [],
    social_links: (data.social_links as SocialLink[]) ?? [],
    hobbies: (data.hobbies as string[]) ?? [],
    relationship_status: (data.relationship_status as string) ?? "",
    current_city: (data.current_city as string) ?? "",
    hometown: (data.hometown as string) ?? "",
    birthday: (data.birthday as string) ?? "",
    gender: (data.gender as string) ?? "",
    languages: (data.languages as string[]) ?? [],
    works: (data.works as Record<string, string>[]) ?? [],
    education: (data.education as Record<string, string>[]) ?? [],
    interests: { ...emptyInterests, ...((data.interests as Interests) ?? {}) },
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
  };
}
