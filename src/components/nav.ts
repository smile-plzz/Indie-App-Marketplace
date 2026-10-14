export type NavItem = { label: string; href: string };

/** The public site navigation links. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Index", href: "/" },
  { label: "App Store", href: "/store" },
  { label: "Projects", href: "/projects" },
  { label: "Film & Drone", href: "/film" },
  { label: "Writing", href: "/writing" },
  { label: "Credentials", href: "/credentials" },
  { label: "Contact", href: "/#contact" },
];

/** Writing stays hidden until the first post publishes. */
export function navItems(hasPosts: boolean): NavItem[] {
  return hasPosts
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href !== "/writing");
}

export const SOCIALS = [
  { short: "LI", label: "LinkedIn", key: "linkedin" },
  { short: "GH", label: "GitHub", key: "github" },
  { short: "YT", label: "YouTube", key: "youtube" },
  { short: "FB", label: "Facebook", key: "facebook" },
] as const;
