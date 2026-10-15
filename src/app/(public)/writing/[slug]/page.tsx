import { getPost } from "@/lib/content";
import type { Block } from "@/lib/portable-text";
import { PortableText } from "@portabletext/react";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { notFound } from "next/navigation";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const post=await getPost(slug);if(!post)notFound();return <MarketplaceLayout><article style={{maxWidth:740,margin:"auto",padding:"80px 24px",lineHeight:1.8}}><p className="kick">{post.date}</p><h1 style={{fontSize:48}}>{post.title}</h1><p>{post.summary}</p><PortableText value={Array.isArray(post.body) ? post.body as Block[] : []}/></article></MarketplaceLayout>}
