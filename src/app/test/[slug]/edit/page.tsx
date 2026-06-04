import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextAuth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import TestForm from "@/components/TestForm/TestForm";

type EditorTest = {
  title: string;
  slug: string;
  creator: { toString: () => string };
  questions: {
    id?: string;
    text: string;
    answers: { id?: string; text: string; isCorrect: boolean }[];
  }[];
};

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const test = (await Test.findOne({ slug }).lean()) as EditorTest | null;

  if (!test) notFound();
  if (test.creator.toString() !== session.user.id) redirect("/dashboard");

  // Strip Mongo internals before handing data to the client form.
  const initialData = {
    title: test.title,
    questions: test.questions.map((q) => ({
      id: q.id,
      text: q.text,
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    })),
  };

  return <TestForm slug={slug} initialData={initialData} />;
}
