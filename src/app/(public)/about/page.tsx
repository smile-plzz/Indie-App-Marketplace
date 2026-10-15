import { getSettings } from "@/lib/content";
import Link from "next/link";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
export const metadata={title:"About Ismail",alternates:{canonical:"/about"}};
export default async function AboutPage(){const settings=await getSettings();return <MarketplaceLayout><article style={{maxWidth:760,margin:"auto",padding:"80px 24px"}}><p className="kick">The person behind the apps</p><h1 style={{fontSize:56}}>{settings.name}</h1><p>{settings.role}</p><p style={{whiteSpace:"pre-line",fontSize:18,lineHeight:1.8}}>{settings.about}</p><div style={{display:"flex",gap:24,marginTop:32}}><Link href="/projects">Explore projects</Link><Link href="/writing">Read my writing</Link><Link href="/store">Browse apps</Link></div></article></MarketplaceLayout>}
