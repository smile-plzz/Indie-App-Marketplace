import { NextResponse } from "next/server";
import { commit, studioWritable, readOnlyResponse } from "@/lib/admin";
export async function POST(request: Request) {
 if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({error:"Invalid origin"},{status:403});
 if (!studioWritable()) return readOnlyResponse();
 try {const body=await request.json();if(typeof body.productId!=="string"||!body.productId||typeof body.licenseType!=="string"||!body.licenseType.trim())return NextResponse.json({error:"Select a product and license type."},{status:400});
 const flags=["licenseApproved","dependencyReviewCompleted","contentLegalityChecked","safetyReviewCompleted","trademarkReviewCompleted","gplComplianceChecked"];
 const fields:Record<string,unknown>={_type:"licenseRecord",product:{_type:"reference",_ref:body.productId},licenseType:body.licenseType.trim(),notes:String(body.notes||""),reviewedAt:new Date().toISOString().slice(0,10)};
 for(const flag of flags)fields[flag]=body[flag]===true;
 await commit(async client=>{const product=await client.getDocument(body.productId);if(product?._type!=="product")throw new Error("Unknown product");const id=await client.fetch<string|null>(`*[_type == "licenseRecord" && product._ref == $id && !(_id in path("drafts.**"))] | order(reviewedAt desc, _updatedAt desc, _id asc)[0]._id`,{id:body.productId});return id?client.patch(id).set(fields).commit():client.create(fields as {_type:string});});return NextResponse.json({success:true});
 }catch{return NextResponse.json({error:"Unable to save the review. Check the content connection."},{status:400});}
}
