import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjects } from "@/lib/content";
import { ProjectsIndex } from "./ProjectsIndex";
import { ProjectsSkeleton } from "./ProjectsSkeleton";

export const metadata: Metadata = {
  title: "Projects",
  description: "Everything I have shipped and kept online.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsIndex projects={projects} />
    </Suspense>
  );
}
