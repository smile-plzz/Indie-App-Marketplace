import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/content";
import { absolute } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  // None of these routes carry a real "last modified" date  -  projects and
  // static pages have no authored timestamp  -  so `lastModified` is omitted
  // rather than stamped with the build time. A fake date on every route
  // tells crawlers everything changed on every deploy, which defeats the
  // signal entirely.
  const routes: MetadataRoute.Sitemap = [
    { url: absolute("/"), priority: 1 },
    { url: absolute("/projects"), priority: 0.9 },
    { url: absolute("/film"), priority: 0.7 },
    { url: absolute("/credentials"), priority: 0.6 },
  ];

  // The writing route stays out of the sitemap until it has something in it,
  // for the same reason the nav link hides. Its lastModified is the newest
  // post's date  -  the one real signal this route has.
  if (posts.length) {
    routes.push({
      url: absolute("/writing"),
      lastModified: new Date(posts[0].date),
      priority: 0.7,
    });
  }

  for (const project of projects) {
    routes.push({
      url: absolute(`/projects/${project.slug}`),
      priority: project.featured ? 0.8 : 0.6,
    });
  }

  for (const post of posts) {
    routes.push({
      url: absolute(`/writing/${post.slug}`),
      lastModified: new Date(post.date),
      priority: 0.5,
    });
  }

  return routes;
}
