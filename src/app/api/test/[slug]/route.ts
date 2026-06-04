import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import Submission from "@/lib/models/submissionSchema";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextAuth";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { slug } = await params;
    const test = await Test.findOne({ slug });
    if (!test) {
      return NextResponse.json({ error: "Cannot find test" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));

    const test = await Test.findOne({ slug });
    if (!test) {
      return NextResponse.json({ error: "Cannot find test" }, { status: 404 });
    }

    if (test.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (typeof body.title === "string") test.title = body.title;
    if (Array.isArray(body.questions)) test.questions = body.questions;

    await test.save();

    return NextResponse.json({ message: "Test updated", slug: test.slug });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const test = await Test.findOne({ slug });
    if (!test) {
      return NextResponse.json({ error: "Cannot find test" }, { status: 404 });
    }

    if (test.creator.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Submission.deleteMany({ test: test._id });
    await test.deleteOne();

    return NextResponse.json({ message: "Test deleted" });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
