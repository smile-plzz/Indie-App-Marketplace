import { notFound } from "next/navigation";
import { adminProject } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { ProjectEditor } from "@/components/admin/ProjectEditor";

type Params = { params: Promise<{ id: string }> };

export default async function ProjectEditorPage({ params }: Params) {
  const { id } = await params;
  const project = await adminProject(decodeURIComponent(id));
  if (!project) notFound();

  return <ProjectEditor project={project} writable={studioWritable()} />;
}
