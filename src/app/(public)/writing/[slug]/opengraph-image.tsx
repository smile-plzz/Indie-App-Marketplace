import { ImageResponse } from "next/og";
import { getPost } from "@/lib/content";
import { ShareCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Post";

type Params = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);

  return new ImageResponse(
    (
      <ShareCard
        kicker={post ? `Writing · ${post.kind}` : "Writing"}
        title={post?.title ?? "Md. Ismail Hossain"}
        footer={truncate(post?.summary ?? "", 110)}
      />
    ),
    size,
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
