import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextAuth";
import Test from "@/lib/models/testSchema";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const slug = body.slug ?? `${session.user.id}-${Date.now()}`;

    await Test.create({
      title: body.title ?? "Новый тест",
      slug,
      questions: body.questions ?? [],
      creator: session.user.id,
    });

    return NextResponse.json(
      { message: "Test created", slug },
      { status: 201 }
    );

  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
