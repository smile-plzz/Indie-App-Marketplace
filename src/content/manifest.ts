/**
 * The real content, transcribed from the live index.html and the CV.
 * This is the source the Sanity seed script writes from  -  not app fixtures.
 * Once seeded, the app reads Sanity; this file stays as the seed of record.
 */

import type {
  AcademicProject,
  Credential,
  ExtraCurricular,
  Experience,
  Project,
  Publication,
  SiteSettings,
  Venture,
} from "@/lib/types";

export const siteSettings: SiteSettings = {
  name: "Md. Ismail Hossain",
  // NEEDS REAL CONTENT  -  Ismail is writing this line.
  positioning: "Your one-line positioning statement sits here.",
  role: "Technology professional",
  location: "Darussalam, Dhaka",
  locationShort: "Dhaka, Bangladesh",
  availability: "Open to new roles",
  about: [
    "Technology professional with a BSc in Computer Science & Engineering and a Master's in Information Technology, bringing hands-on experience across IT infrastructure implementation, system administration, and SaaS platform operations.",
    "Adept at bridging technical and business functions, translating user needs into actionable solutions, coordinating cross-functional teams, and managing end-to-end delivery across both institutional and commercial environments. Currently seeking a role where technical breadth, stakeholder communication, and a product-oriented mindset can contribute to meaningful outcomes.",
  ],
  email: "ismailhossain013@gmail.com",
  phone: "+88 01866 304933",
  phoneHref: "+8801866304933",
  resumeUrl:
    "https://drive.google.com/file/d/1pOiLd7gFZAf1DXLoCGrbIxLBwm9iWyn_/view",
  links: {
    linkedin: "https://www.linkedin.com/in/md-ismail-hossain-2938541b1/",
    github: "https://github.com/smile-plzz",
    youtube: "https://www.youtube.com/@ismailhossain1019",
    facebook: "https://www.facebook.com/optimisticyetpessimist/",
  },
  formspreeEndpoint: "https://formspree.io/f/mrbkyqdd",
  visitorBadgeUrl:
    "https://visitor-badge.laobi.icu/badge?page_id=ismailhossain.portfolio",
  contactHeadline: "Let's connect to build something innovative.",
};

/** Four clusters, AI tooling first  -  the thing the old site buried. */
export const skillGroups = [
  {
    label: "AI-augmented engineering",
    items: [
      { name: "Claude Code", accent: true },
      { name: "Gemini CLI", accent: true },
      { name: "Cursor", accent: true },
      { name: "Antigravity", accent: true },
      { name: "Context engineering", accent: false },
      { name: "n8n", accent: false },
      { name: "Zapier", accent: false },
    ],
  },
  {
    label: "Product & delivery",
    items: [
      { name: "Jira", accent: false },
      { name: "Trello", accent: false },
      { name: "ReAmaze", accent: false },
      { name: "Requirement analysis", accent: false },
      { name: "Feature QA", accent: false },
      { name: "Documentation", accent: false },
    ],
  },
  {
    label: "Systems & code",
    items: [
      { name: "C", accent: false },
      { name: "HTML5", accent: false },
      { name: "CSS3", accent: false },
      { name: "JavaScript", accent: false },
      { name: "Python", accent: false },
      { name: "GitHub", accent: false },
      { name: "Linux", accent: false },
      { name: "LAN/WAN", accent: false },
    ],
  },
  {
    label: "Production",
    items: [
      { name: "Premiere Pro", accent: false },
      { name: "Lightroom", accent: false },
      { name: "Photoshop", accent: false },
      { name: "Audacity", accent: false },
      { name: "Aerial cinematography", accent: false },
    ],
  },
];

/**
 * All fourteen live projects. `imageHeight` is the authored masonry height
 * from the design  -  deliberate, not random, and stable across loads.
 * problem/approach/outcome are PLACEHOLDER  -  flagged for Ismail to write.
 */
export const projects: Project[] = [
  {
    order: 1,
    slug: "watchmatch",
    category: "AI & Agents",
    title: "WatchMatch",
    year: "2026",
    summary:
      "Chat-based assistant that recommends specific, real movies and TV shows to watch.",
    tags: ["AI Chat", "Recommendation"],
    liveUrl: "https://watch-match-mu.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: "Next.js · Gemini",
    featured: true,
    imageHeight: 230,
    placeholderCopy: true,
    problem:
      "Recommendation engines answer with genres and lists. What people actually want, mid-conversation, is one title they can start tonight  -  with a reason attached.",
    approach:
      "A chat surface constrained to real, verifiable titles: the model proposes, a catalogue lookup confirms the title exists and is streamable, and the reply carries the reason it fits what was asked.",
    outcome: "Deployed on Vercel and still running.",
  },
  {
    order: 2,
    slug: "brainstorm-ai-v2",
    category: "AI & Agents",
    title: "Brainstorm.AI V2",
    year: "2026",
    summary:
      "Build custom multi-agent AI expert panels to brainstorm, debate, and refine ideas.",
    tags: ["Multi-Agent", "AI Ideation"],
    liveUrl: "https://brainstorm-ai-v2.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: true,
    imageHeight: 170,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 3,
    slug: "tcra-code-auditor-v4",
    category: "AI & Agents",
    title: "TCRA Code Auditor V4",
    year: "2026",
    summary:
      "AI-powered code auditor for Transparency, Controllability, Reliability & Auditability, with cross-provider benchmarking.",
    tags: ["AI Tooling", "Code Audit"],
    liveUrl: "https://tcra-code-auditor-v4.onrender.com/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 200,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 4,
    slug: "physiotrace",
    category: "Health Tech",
    title: "PhysioTrace",
    year: "2026",
    summary:
      "Predictive pharmacokinetic simulation engine visualizing medication impact on a personalized digital twin.",
    tags: ["Simulation", "Health Tech"],
    liveUrl: "https://physio-trace.vercel.app/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: true,
    imageHeight: 260,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 5,
    slug: "time-capsule",
    category: "Data Viz",
    title: "Time Capsule",
    year: "2026",
    summary:
      "Transforms Facebook archives into a searchable, interactive timeline  -  rediscover your story.",
    tags: ["Data Viz", "Personal Archive"],
    liveUrl: "https://time-capsule-peach.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 160,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 6,
    slug: "hivemind-v4",
    category: "AI & Agents",
    title: "HiveMind V4",
    year: "2026",
    summary:
      "Collaborative multi-agent AI system for coordinated group decision-making.",
    tags: ["Multi-Agent", "Full-Stack"],
    liveUrl: "https://hivemind-v4-1.onrender.com/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 210,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 7,
    slug: "swipetrack",
    category: "Full-Stack",
    title: "SwipeTrack",
    year: "2026",
    summary:
      "A swipe-based way to log movies, series and games  -  swipe right to track, up to prioritize.",
    tags: ["UI/UX", "Tracking"],
    liveUrl: "https://swipe-track.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 250,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 8,
    slug: "westeros-chronicles",
    category: "Data Viz",
    title: "Westeros Chronicles",
    year: "2026",
    summary:
      "Ultra-detailed animated interactive timeline map tracking character movements across all eight seasons.",
    tags: ["Interactive Map", "Data Viz"],
    liveUrl: "https://westeros-chronicles-interactive-tim.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: true,
    imageHeight: 180,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 9,
    slug: "omnistream-tv",
    category: "Streaming",
    title: "OmniStream TV",
    year: "2026",
    summary:
      "A premium international TV streaming platform with global channels and a cinematic viewing experience.",
    tags: ["Streaming", "Showcase"],
    liveUrl: "https://omni-stream-tv.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 230,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 10,
    slug: "astronode-orbital-dashboard",
    category: "Data Viz",
    title: "AstroNode Orbital Dashboard",
    year: "2026",
    summary:
      "High-fidelity mission control dashboard tracking space stations, commercial modules, and upcoming launches.",
    tags: ["Real-time API", "Data Viz"],
    liveUrl: "https://astro-node-live-orbital-dashboard.vercel.app/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: true,
    imageHeight: 170,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 11,
    slug: "medicine-tracker",
    category: "Health Tech",
    title: "Medicine Tracker",
    year: "2026",
    summary: "Track medication schedules, dosages, and adherence over time.",
    tags: ["Health Tech", "Front-End"],
    liveUrl: "https://medicine-tracker-gilt.vercel.app/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 200,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 12,
    slug: "market-weather-analytics",
    category: "Data Viz",
    title: "Market-Weather Analytics",
    year: "2026",
    summary: "Real-time dashboard correlating market data with weather analytics.",
    tags: ["Real-time API", "Dashboard"],
    liveUrl: "https://real-time-market-weather-analytics.vercel.app",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 240,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 13,
    slug: "event-finder",
    category: "Full-Stack",
    title: "Event Finder",
    year: "2026",
    summary:
      "Full-stack rebuild of the geolocation-based event search app with a persistent backend.",
    tags: ["Full-Stack", "Geolocation"],
    liveUrl: "https://real-time-event-finder-full-stack.vercel.app/",
    repoUrl: null,
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 160,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
  {
    order: 14,
    slug: "cinegemini-stream",
    category: "Streaming",
    title: "CineGemini Stream",
    year: "2026",
    summary: "Gemini-powered movie discovery and streaming companion app.",
    tags: ["Gemini API", "Streaming"],
    liveUrl: "https://smile-plzz.github.io/CineGemini-Stream/",
    repoUrl: "https://github.com/smile-plzz/CineGemini-Stream",
    role: "Solo build",
    stack: null,
    featured: false,
    imageHeight: 210,
    placeholderCopy: true,
    problem: null,
    approach: null,
    outcome: null,
  },
];

export const experiences: Experience[] = [
  {
    order: 1,
    role: "Executive  -  Customer Relationship Management",
    org: "Devsnest LLC",
    orgNote: "Shopify-native SaaS",
    period: "Apr 2025  - ",
    bullets: [
      "Managed end-to-end merchant lifecycle for a Shopify-native SaaS platform, including store access provisioning, app installation, and widget configuration across multiple merchant environments. Ensured smooth onboarding and deployment, reducing setup friction and enabling consistent activation of core product features across merchant stores.",
      "Conducted requirement analysis and translated merchant needs into clear feature specifications; collaborated with development teams to track, prioritize, and resolve technical issues. Led feature QA and validation, performed merchant-level testing, and ensured production readiness. Managed merchant reporting, documented feature updates, and maintained structured communication throughout the development lifecycle using tools like ReAmaze and Trello.",
      "Collaborated with product and development teams to translate merchant feedback into actionable feature enhancements, contributing to increased merchant retention, product adoption, and growth in Monthly and Annual Recurring Revenue (MRR/ARR) for the SaaS platform.",
      "Authored and maintained the official user-facing app documentation for the Dynamatic Shopify platform (help.dynamaticapp.com), covering core product areas including Widgets, Analytics, A/B Testing, Dynamatic Cart, Feeds, Bundles, and Settings, translating complex platform features into clear, merchant-friendly guides to reduce onboarding friction and support self-service adoption.",
    ],
    links: [
      { label: "devsnest.net", url: "https://devsnest.net/" },
      { label: "dynamaticapp.com", url: "https://dynamaticapp.com/" },
    ],
  },
  {
    order: 2,
    role: "IT Trainer & Consultant",
    org: "Dhaka Technical Teachers Training Institute",
    orgNote: null,
    period: "Mar 2023  -  Dec 2025",
    bullets: [
      "Delivered NSDA-accredited Computer Operation Level 3 and IT Support Level 3 programmes covering theoretical instruction and hands-on practical assessments.",
      "Conducted IT training courses covering networking fundamentals, Microsoft Office and Google Workspace, digital literacy, and hardware troubleshooting; upskilled administrative staff in digital teaching methodologies and LMS usage.",
      "Integrated LLM-based tools and AI-augmented approaches into training delivery to enhance engagement and support self-directed learning.",
      "Oversaw end-to-end IT infrastructure implementation  -  structured cabling, LAN/WAN configuration, internet gateway setup, and Linux-based server deployment  -  managing the full vendor lifecycle from requirement scoping through to final commissioning.",
      "Administered institutional servers for file sharing, LMS hosting, domain control, and network management; coordinated LMS development with a third-party contractor and conducted staff orientation sessions to drive adoption across faculty and administration.",
    ],
    links: [],
  },
];

export const ventures: Venture[] = [
  {
    order: 1,
    slug: "no-more-free-music",
    name: "No More Free Music",
    shortName: "NMFM",
    role: "Co-founder",
    period: "2021  -  2022",
    periodShort: "2021-22",
    lead: "Co-led an independent music initiative challenging the culture of unpaid exposure for local artists in Bangladesh.",
    homeBlurb:
      "An independent music initiative challenging the culture of unpaid exposure for local artists in Bangladesh  -  pre-release paid distribution, tier-based artist compensation, live showcases.",
    bullets: [
      "Pioneered a pre-release paid distribution model where listeners paid any amount to receive high-quality audio, visuals, and exclusive content via email  -  before official platform release.",
      "Implemented a tier-based artist compensation structure funded through ticket revenue, ensuring all performing artists were paid fairly regardless of profile or following.",
      "Produced and managed live events including the debut showcase NMFM Unplugged 1 and music video premieres for *Ojanay* by Velvet Wings and *Othocho* by Fantasy Realm.",
      "Led end-to-end digital campaigns covering content strategy, creatives (banners, posters), social media promotion, audience targeting, and performance analytics across YouTube and Facebook.",
    ],
    videos: [
      { id: "hNCHZ_7bI2Q", title: "Ojanay  -  Velvet Wings" },
      { id: "3SPRwvR0i_o", title: "NMFM Unplugged 1" },
      { id: "be25ub6dnsQ", title: "Othocho  -  Fantasy Realm" },
      { id: "HytEmVoZoao", title: "Campaign cut" },
    ],
  },
  {
    order: 2,
    slug: "15-miles",
    name: "15-Miles",
    shortName: "15-Miles",
    role: "Founder",
    period: "2021  -  2023",
    periodShort: "2021-23",
    lead: "Founded and operated a solo video production company specializing in documentaries, music videos, and aerial cinematography.",
    homeBlurb:
      "A solo video production company  -  documentaries, music videos, aerial cinematography. Six drone survey projects for private and government-affiliated clients.",
    bullets: [
      "Directed and delivered the institutional documentary *Institute of Marine Technology, Chandpur* end to end  -  handling scripting, filming, editing, and final delivery as a solo production.",
      "Produced live music video content for independent bands, managing all stages from shoot coordination to post-production.",
      "Completed six drone cinematography and survey projects for private and government-affiliated clients, delivering aerial footage for both commercial and civil engineering purposes.",
    ],
    videos: [
      { id: "emZoF0r4_aE", title: "IMT Chandpur  -  documentary" },
      { id: "ztm412kovcE", title: "Aftermath  -  live" },
      { id: "zCWmwOvZsME", title: "Aerial survey" },
      { id: "2b7pnUNBKUk", title: "Drone cinematography" },
    ],
  },
];

export const education = [
  {
    degree: "Masters in Information Technology",
    institution: "Jahangirnagar University",
    period: "2026 expected",
    gpa: "3.52 / 4.00",
    department: null,
    coursework: [
      "Cloud & Mobile Computing",
      "AI & Neural Networks",
      "IoT & Fog Computing",
      "Data Science",
      "Software Testing & QA",
      "Mobile App Development",
      "Wireless Network",
      "Data Mining & Knowledge Discovery",
      "Machine Learning",
      "HCI",
    ],
  },
  {
    degree: "BSc in Computer Science & Engineering",
    institution: "North South University",
    period: "2023",
    gpa: "2.63 / 4.00",
    department: "Department of Electrical & Computer Engineering",
    coursework: [
      "Database Systems",
      "Design and Analysis of Algorithms",
      "Digital Logic Design",
      "Operating Systems Design",
      "Software Engineering",
      "Computer Organization and Architecture",
      "Microprocessor Interfacing and Embedded Systems",
    ],
  },
];

export const secondaryEducation = [
  {
    school: "Government Bangla College",
    qualification: "HSC (Science)",
    year: "2018",
    gpa: "3.83 / 5.00",
  },
  {
    school: "Dhanmondi Govt Boys High School",
    qualification: "SSC (Science)",
    year: "2016",
    gpa: "5.00 / 5.00",
  },
];

/**
 * Fifteen certificates across five issuers. Grouped by issuer on
 * /credentials, collapsed by default.
 *
 * NOTE: the CV lists three Atlassian certificates; the live site lists four
 * including Forge Fundamentals. Four kept, per the design decision. Confirm.
 */
export const credentials: Credential[] = [
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "Introduction to Subagents",
    date: "Jun 2026",
    verifyUrl: "https://verify.skilljar.com/c/7mdk4gnpk8hj",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "AI Fluency Framework & Foundations",
    date: "Jun 2026",
    verifyUrl: "https://verify.skilljar.com/c/8ivbfhxr7njm",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "AI Capabilities and Limitations",
    date: "Jun 2026",
    verifyUrl: "https://verify.skilljar.com/c/6e5gbnd844oc",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "AI Fluency for Small Businesses",
    date: "Jun 2026",
    verifyUrl: "https://verify.skilljar.com/c/egkrnecyvojf",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "Introduction to Claude Cowork",
    date: "May 2026",
    verifyUrl: "https://verify.skilljar.com/c/nsezy3bvuenr",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "Introduction to Agent Skills",
    date: "May 2026",
    verifyUrl: "https://verify.skilljar.com/c/9gjmc774re8r",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "Claude Code 101",
    date: "May 2026",
    verifyUrl: "https://verify.skilljar.com/c/8rkgztgs4gq7",
  },
  {
    group: "Anthropic  -  AI & Automation",
    issuer: "Anthropic",
    name: "Claude 101",
    date: "May 2026",
    verifyUrl: "https://verify.skilljar.com/c/wditqew8b5ss",
  },
  {
    group: "Atlassian Ecosystem",
    issuer: "Atlassian",
    name: "Forge Fundamentals",
    date: "Jul 2026",
    verifyUrl:
      "https://cp.certmetrics.com/atlassian/en/public/verify/credential/f676d5c5106645af8ec910fc8ed1be48",
  },
  {
    group: "Atlassian Ecosystem",
    issuer: "Atlassian",
    name: "Rovo Fundamentals",
    date: "Jul 2026",
    verifyUrl:
      "https://cp.certmetrics.com/atlassian/en/public/verify/credential/1f0a29dea754465fb931be81f7a5c51d",
  },
  {
    group: "Atlassian Ecosystem",
    issuer: "Atlassian",
    name: "Loom Fundamentals",
    date: "Jul 2026",
    verifyUrl:
      "https://cp.certmetrics.com/atlassian/en/public/verify/credential/1cbb96fe03ea47b69c950e345272b1b8",
  },
  {
    group: "Atlassian Ecosystem",
    issuer: "Atlassian",
    name: "Jira Service Management with AI Fundamentals",
    date: "Jul 2026",
    verifyUrl:
      "https://cp.certmetrics.com/atlassian/en/public/verify/credential/8e84c172069c41938d4fcb1cf8ec5caa",
  },
  {
    group: "National Skills Development Authority",
    issuer: "NSDA",
    name: "Computer Operation Level-3",
    date: "Feb 2025",
    verifyUrl:
      "https://www.skillsportal.gov.bd/#/rpl/certificate-view?rplCandidateId=AGyeV7SZi8IDV9obk%2FZsbQ%3D%3D",
  },
  {
    group: "Cisco Networking Academy",
    issuer: "Cisco",
    name: "Introduction to Cybersecurity",
    date: "Dec 2024",
    verifyUrl:
      "https://www.credly.com/badges/943974f9-9838-4978-837b-37c3d1113021/public_url",
  },
  {
    group: "British Council Bangladesh",
    issuer: "British Council",
    name: "English (Upper-Intermediate  -  B2 Level)",
    date: "May 2016",
    verifyUrl: null,
  },
];

export const academicProjects: AcademicProject[] = [
  {
    order: 1,
    title: "Healthcare System with OCR",
    kind: "Senior capstone · group",
    description:
      "A healthcare system for doctor consultations with an organized database for patient medical histories, using OCR to digitize prescriptions  -  cutting data entry time by 40%.",
    stack: "HTML, CSS, React JS, SQL · OpenCV, PyTesseract, TensorFlow",
  },
  {
    order: 2,
    title: "Online Arts & Crafts Shop Management System",
    kind: "Junior capstone · individual",
    description:
      "A full-stack e-commerce platform with inventory tracking, sales analytics and a payment processing system.",
    stack: "HTML, CSS, AJAX",
  },
  {
    order: 3,
    title: "Hotel Management System",
    kind: "Course project · group",
    description:
      "A system streamlining hotel operations including bookings and billing, with an interactive desktop interface.",
    stack: "Java, JavaFX",
  },
  {
    order: 4,
    title: "Bank Database System",
    kind: "Course project · group",
    description:
      "A database for managing client and employee information in a banking environment.",
    stack: "C",
  },
];

export const publications: Publication[] = [
  {
    order: 1,
    title: "Med-Tech: Online doctor consultation with OCR",
    authors: "Md. Ismail Hossain, Sabab Ishraq, Md. Fazlay Rabbi Nabid",
    supervisor: "Dr. Shohana Rahman Deeba, Associate Professor",
    institution:
      "Department of Electrical & Computer Engineering, North South University",
  },
  {
    order: 2,
    title: "Brain Tumor Classification using Efficient-Net and Grad-Cam",
    authors: "Md. Ismail Hossain, MD. Kawser Islam, Yeaser Shams",
    supervisor: "Dr. Mohammad Monirujjaman Khan, Associate Professor",
    institution:
      "Department of Electrical & Computer Engineering, North South University",
  },
];

export const extraCurricular: ExtraCurricular[] = [
  {
    order: 1,
    title: "Facilitated training sessions",
    description:
      "a 3-day programme on Management of E-Learning at a government institution.",
    linkLabel: "Documentation",
    linkUrl:
      "https://drive.google.com/file/d/1P6q826ApUesOYAlUoxmQ4nlk0gh48crB/view?usp=sharing",
  },
  {
    order: 2,
    title: "Documentary production",
    description:
      "Institute of Marine Technology, Chandpur, and a live performance for the band Aftermath.",
    linkLabel: "Watch",
    linkUrl: "https://youtu.be/-Do0eJRvRZA",
  },
  {
    order: 3,
    title: "Aerial drone survey",
    description: "for a civil firm supporting government projects.",
    linkLabel: null,
    linkUrl: null,
  },
  {
    order: 4,
    title: "Network infrastructure",
    description: "computer lab design at DTTTI.",
    linkLabel: "Documentation",
    linkUrl:
      "https://drive.google.com/file/d/1ZdytCkYh4Mr8OCLNv8LBRq2j9rpgwyC9/view?usp=sharing",
  },
];

/** Writing starts empty  -  the nav link stays hidden until the first post. */
export const posts: never[] = [];
