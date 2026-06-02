import authOptions from "@/lib/auth/nextAuth";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    await dbConnect()
    try {

        const session = await getServerSession(authOptions)

        if(!session?.user?.id) return NextResponse.json({error: "Unauthorized"}, {status: 401})
        
        const tests = await Test.find({creator: session.user.id})

        return NextResponse.json(tests)
    } catch {
        return NextResponse.json({error: "Server error"}, {status: 500})
    }
}
