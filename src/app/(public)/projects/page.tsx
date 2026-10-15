import { getProjects } from "@/lib/content";
import { ProjectCard } from "@/components/ProjectCard";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
export const metadata={title:"Projects",alternates:{canonical:"/projects"}};
export default async function ProjectsPage(){const projects=await getProjects();return <MarketplaceLayout><main style={{maxWidth:1080,margin:"auto",padding:"64px 24px"}}><p className="kick">Selected work</p><h1 style={{fontSize:52,marginBottom:40}}>Ideas made tangible.</h1><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))",gap:32}}>{projects.map(project=><ProjectCard key={project.slug} project={project}/>)}</div></main></MarketplaceLayout>}
