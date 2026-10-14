export type ImageRef = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
} | null;

export type Project = {
  order: number;
  slug: string;
  title: string;
  year: string;
  summary: string;
  /** The curated filter category on /projects  -  five, not the raw tag list. */
  category: string;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  role: string | null;
  stack: string | null;
  featured: boolean;
  /** Authored masonry height in px  -  deliberate ranking, stable across loads. */
  imageHeight: number;
  /** True while problem/approach/outcome are still scaffolding, not Ismail's words. */
  placeholderCopy: boolean;
  problem: string | null;
  approach: string | null;
  outcome: string | null;
  shot?: ImageRef;
};

export type ExperienceLink = { label: string; url: string };

export type Experience = {
  order: number;
  role: string;
  org: string;
  orgNote: string | null;
  period: string;
  bullets: string[];
  links: ExperienceLink[];
};

export type Video = { id: string; title: string };

export type Venture = {
  order: number;
  slug: string;
  name: string;
  shortName: string;
  role: string;
  period: string;
  periodShort: string;
  lead: string;
  homeBlurb: string;
  bullets: string[];
  videos: Video[];
};

export type Credential = {
  group: string;
  issuer: string;
  name: string;
  date: string;
  verifyUrl: string | null;
};

export type AcademicProject = {
  order: number;
  title: string;
  kind: string;
  description: string;
  stack: string;
};

export type Publication = {
  order: number;
  title: string;
  authors: string;
  supervisor: string;
  institution: string;
};

export type ExtraCurricular = {
  order: number;
  title: string;
  description: string;
  linkLabel: string | null;
  linkUrl: string | null;
};

export type PostKind = "Essay" | "Note";

export type Post = {
  slug: string;
  title: string;
  date: string;
  kind: PostKind;
  summary: string;
  readingMinutes: number | null;
  tags: string[];
  body: unknown;
};

export type SiteSettings = {
  name: string;
  positioning: string;
  role: string;
  location: string;
  locationShort: string;
  availability: string;
  about: string[];
  email: string;
  phone: string;
  phoneHref: string;
  resumeUrl: string;
  links: {
    linkedin: string;
    github: string;
    youtube: string;
    facebook: string;
  };
  formspreeEndpoint: string;
  visitorBadgeUrl: string;
  contactHeadline: string;
  portrait?: ImageRef;
};
