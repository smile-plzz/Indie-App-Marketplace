import { getPosts } from "@/lib/content";

import Link from "next/link";

import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";

export const metadata={title:"Writing",alternates:{canonical:"/writing"}};

export default async function Page(){const posts=await getPosts();return <MarketplaceLayout><main style={{maxWidth:800,margin:"auto",padding:"80px 24px"}}><p className="kick">Notes & essays</p><h1 style={{fontSize:52}}>Thinking out loud.</h1>{posts.length?posts.map(post=><article key={post.slug} style={{padding:"32px 0",borderBottom:"1px solid var(--color-divider)"}}><h2><Link href={`/writing/${post.slug}`}>{post.title}</Link></h2><p>{post.summary}</p><small>{post.date} · {post.readingMinutes} min read</small></article>):<p style={{marginTop:32}}>New writing will appear here when published.</p>}</main></MarketplaceLayout>}
