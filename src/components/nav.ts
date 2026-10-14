export type NavItem = { label: string; href: string };

/** The public site navigation links for Indie App Marketplace. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Showcase", href: "/" },
  { label: "Browse Apps", href: "/#catalog" },
  { label: "Why Open Source?", href: "/license" },
  { label: "Lookup Orders", href: "/store/orders" },
  { label: "Support", href: "/contact" },
];

export function navItems(): NavItem[] {
  return NAV_ITEMS;
}

export const SOCIALS = [
  { short: "GH", label: "GitHub", key: "github" },
  { short: "LI", label: "LinkedIn", key: "linkedin" },
  { short: "YT", label: "YouTube", key: "youtube" },
  { short: "FB", label: "Facebook", key: "facebook" },
] as const;
