import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: Promise<{slug: string}>}) {
    await dbConnect()
    
    try {
     const {slug} = await params
     const test = await Test.findOne({slug})
     if(!test) return NextResponse.json({error: "Cannot find test"}, {status: 404})
        
     return NextResponse.json(test)

    } catch {
        return NextResponse.json({error: "server error"}, {status: 500})
    } 
}
