import { getProject } from "@/lib/content";
import { ProjectDetailView } from "@/components/ProjectDetail";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { notFound } from "next/navigation";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const project=await getProject(slug);if(!project)notFound();return <MarketplaceLayout><article style={{maxWidth:1000,margin:"auto",padding:"64px 24px"}}><ProjectDetailView project={project}/></article></MarketplaceLayout>}
