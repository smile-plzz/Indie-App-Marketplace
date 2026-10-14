/**
 * Document types consumed by Sanity Studio and /admin.
 * Includes portfolio types and Indie App Marketplace types (product, release, licenseRecord).
 */

const project = {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (r: Rule) => r.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r: Rule) => r.required(),
    },
    { name: "order", type: "number", validation: (r: Rule) => r.required() },
    { name: "year", type: "string" },
    { name: "summary", type: "text", rows: 2 },
    {
      name: "category",
      type: "string",
      description: "The filter chip on /projects.",
      options: {
        list: ["AI & Agents", "Data Viz", "Full-Stack", "Health Tech", "Streaming"],
      },
    },
    { name: "tags", type: "array", of: [{ type: "string" }] },
    { name: "liveUrl", type: "url" },
    { name: "repoUrl", type: "url" },
    { name: "role", type: "string" },
    { name: "stack", type: "string" },
    { name: "problem", type: "text", rows: 4 },
    { name: "approach", type: "text", rows: 4 },
    { name: "outcome", type: "text", rows: 3 },
    {
      name: "placeholderCopy",
      title: "Write-up is still placeholder",
      type: "boolean",
      description: "Flag until the problem/approach/outcome are Ismail's own words.",
      initialValue: true,
    },
    {
      name: "shot",
      title: "Screenshot",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    },
    {
      name: "imageHeight",
      type: "number",
      description:
        "Authored masonry height in px (160 to 260). Deliberate ranking, not random.",
      initialValue: 200,
    },
    { name: "featured", title: "Featured on home", type: "boolean", initialValue: false },
    { name: "hidden", title: "Hide from index", type: "boolean", initialValue: false },
  ],
  preview: {
    select: { title: "title", subtitle: "summary", media: "shot" },
  },
};

const post = {
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (r: Rule) => r.required() },
    { name: "slug", type: "slug", options: { source: "title" } },
    { name: "date", type: "date", validation: (r: Rule) => r.required() },
    {
      name: "kind",
      type: "string",
      options: { list: ["Essay", "Note"] },
      initialValue: "Note",
    },
    { name: "summary", type: "text", rows: 3 },
    { name: "readingMinutes", type: "number" },
    { name: "tags", type: "array", of: [{ type: "string" }] },
    {
      name: "body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Body", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Sub-heading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [{ title: "Italic", value: "em" }],
            annotations: [
              {
                name: "link",
                type: "object",
                fields: [{ name: "href", type: "url" }],
              },
            ],
          },
        },
        { type: "image", fields: [{ name: "alt", type: "string" }] },
      ],
    },
  ],
};

const venture = {
  name: "venture",
  title: "Venture",
  type: "document",
  fields: [
    { name: "name", type: "string" },
    { name: "shortName", type: "string" },
    { name: "slug", type: "slug", options: { source: "name" } },
    { name: "order", type: "number" },
    { name: "role", type: "string" },
    { name: "period", type: "string" },
    { name: "periodShort", type: "string" },
    { name: "lead", type: "text", rows: 3 },
    { name: "homeBlurb", type: "text", rows: 3 },
    { name: "bullets", type: "array", of: [{ type: "text" }] },
    {
      name: "videos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", title: "YouTube ID", type: "string" },
            { name: "title", type: "string" },
          ],
        },
      ],
    },
  ],
};

const experience = {
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    { name: "role", type: "string" },
    { name: "org", type: "string" },
    { name: "orgNote", type: "string" },
    { name: "period", type: "string" },
    { name: "order", type: "number" },
    { name: "bullets", type: "array", of: [{ type: "text" }] },
    {
      name: "links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string" },
            { name: "url", type: "url" },
          ],
        },
      ],
    },
  ],
};

const credential = {
  name: "credential",
  title: "Credential",
  type: "document",
  fields: [
    { name: "name", type: "string" },
    { name: "issuer", type: "string" },
    { name: "group", title: "Accordion group", type: "string" },
    { name: "date", type: "string" },
    { name: "verifyUrl", type: "url" },
  ],
};

const publication = {
  name: "publication",
  title: "Publication",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "authors", type: "string" },
    { name: "supervisor", type: "string" },
    { name: "institution", type: "string" },
    { name: "order", type: "number" },
  ],
};

const academicProject = {
  name: "academicProject",
  title: "Academic project",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "kind", type: "string" },
    { name: "description", type: "text", rows: 3 },
    { name: "stack", type: "string" },
    { name: "order", type: "number" },
  ],
};

const extraCurricular = {
  name: "extraCurricular",
  title: "Extra-curricular",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "description", type: "text", rows: 2 },
    { name: "linkLabel", type: "string" },
    { name: "linkUrl", type: "url" },
    { name: "order", type: "number" },
  ],
};

const siteSettings = {
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    { name: "name", type: "string" },
    {
      name: "positioning",
      title: "Positioning line",
      type: "string",
      description: "The one sentence the home page opens with.",
    },
    { name: "role", type: "string" },
    { name: "location", type: "string" },
    { name: "locationShort", type: "string" },
    { name: "availability", type: "string" },
    { name: "about", type: "array", of: [{ type: "text" }] },
    { name: "email", type: "string" },
    { name: "phone", type: "string" },
    { name: "phoneHref", type: "string" },
    { name: "resumeUrl", type: "url" },
    {
      name: "links",
      type: "object",
      fields: [
        { name: "linkedin", type: "url" },
        { name: "github", type: "url" },
        { name: "youtube", type: "url" },
        { name: "facebook", type: "url" },
      ],
    },
    { name: "formspreeEndpoint", type: "url" },
    { name: "visitorBadgeUrl", type: "url" },
    { name: "contactHeadline", type: "string" },
    {
      name: "portrait",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string" }],
    },
  ],
};

/**
 * Indie App Marketplace Schemas
 */
const product = {
  name: "product",
  title: "App Product",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (r: Rule) => r.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r: Rule) => r.required(),
    },
    { name: "tagline", type: "string", validation: (r: Rule) => r.required() },
    { name: "summary", type: "text", rows: 2 },
    { name: "description", type: "text", rows: 5 },
    {
      name: "category",
      type: "string",
      options: {
        list: [
          "System Utilities",
          "Media & Video",
          "Productivity",
          "Developer Tools",
          "Gaming & Performance",
        ],
      },
    },
    {
      name: "priceBDT",
      title: "Price in BDT (Poisha as integer)",
      type: "number",
      validation: (r: Rule) => r.required(),
    },
    {
      name: "priceUSD",
      title: "Price in USD (Cents as integer)",
      type: "number",
      validation: (r: Rule) => r.required(),
    },
    {
      name: "status",
      type: "string",
      options: { list: ["draft", "published", "archived"] },
      initialValue: "draft",
    },
    { name: "featured", type: "boolean", initialValue: false },
    { name: "repoUrl", title: "GitHub Repo URL", type: "url", validation: (r: Rule) => r.required() },
    { name: "license", type: "string", initialValue: "MIT" },
    { name: "minOS", type: "string", initialValue: "Windows 10 / 11 (64-bit)" },
    { name: "systemRequirements", type: "array", of: [{ type: "string" }] },
    {
      name: "features",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string" },
            { name: "description", type: "text" },
          ],
        },
      ],
    },
    {
      name: "faq",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", type: "string" },
            { name: "answer", type: "text" },
          ],
        },
      ],
    },
    {
      name: "shot",
      title: "Product Screenshot",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    },
    { name: "installerFileKey", title: "Storage File Key", type: "string" },
    { name: "sha256Checksum", title: "SHA-256 Checksum", type: "string" },
    { name: "currentVersion", title: "Current Version", type: "string", initialValue: "v1.0.0" },
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", media: "shot" },
  },
};

const release = {
  name: "release",
  title: "App Release",
  type: "document",
  fields: [
    {
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (r: Rule) => r.required(),
    },
    { name: "version", type: "string", validation: (r: Rule) => r.required() },
    { name: "releaseDate", type: "date", validation: (r: Rule) => r.required() },
    { name: "changelog", type: "text", rows: 4 },
    { name: "installerFileKey", type: "string", validation: (r: Rule) => r.required() },
    { name: "sha256Checksum", type: "string", validation: (r: Rule) => r.required() },
    { name: "isSigned", type: "boolean", initialValue: true },
    { name: "minOS", type: "string", initialValue: "Windows 10 / 11 (64-bit)" },
    { name: "isLatest", type: "boolean", initialValue: true },
  ],
  preview: {
    select: { title: "version", subtitle: "releaseDate" },
  },
};

const licenseRecord = {
  name: "licenseRecord",
  title: "License Review Record",
  type: "document",
  fields: [
    {
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (r: Rule) => r.required(),
    },
    { name: "licenseType", type: "string", validation: (r: Rule) => r.required() },
    { name: "gplComplianceChecked", type: "boolean", initialValue: true },
    { name: "dependencyReviewCompleted", type: "boolean", initialValue: true },
    { name: "contentLegalityChecked", type: "boolean", initialValue: true },
    { name: "notes", type: "text", rows: 3 },
    { name: "reviewedAt", type: "date" },
  ],
};

type Rule = { required: () => unknown; min?: (n: number) => unknown };

export const schemaTypes = [
  project,
  post,
  venture,
  experience,
  credential,
  publication,
  academicProject,
  extraCurricular,
  siteSettings,
  product,
  release,
  licenseRecord,
];
