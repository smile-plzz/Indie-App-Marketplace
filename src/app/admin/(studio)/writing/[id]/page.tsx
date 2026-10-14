import { notFound } from "next/navigation";
import { adminPost } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { PostEditor } from "@/components/admin/PostEditor";
import { blocksToMarkdown } from "@/lib/portable-text";

type Params = { params: Promise<{ id: string }> };

export default async function PostEditorPage({ params }: Params) {
  const { id } = await params;
  const post = await adminPost(decodeURIComponent(id));
  if (!post) notFound();

  return (
    <PostEditor
      post={post}
      source={blocksToMarkdown(post.body)}
      writable={studioWritable()}
    />
  );
}
