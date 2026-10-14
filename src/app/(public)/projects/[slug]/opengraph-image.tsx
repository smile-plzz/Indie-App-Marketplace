import { ImageResponse } from "next/og";
import { getProject } from "@/lib/content";
import { ShareCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project";

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);

  return new ImageResponse(
    (
      <ShareCard
        kicker={project ? `Project · ${project.category}` : "Project"}
        title={project?.title ?? "Md. Ismail Hossain"}
        footer={truncate(project?.summary ?? "", 110)}
      />
    ),
    size,
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
