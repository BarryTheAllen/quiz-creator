import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import Submission from "@/lib/models/submissionSchema";
import { calculateGrade } from "@/utils/calculateGrade";

type AnswerDoc = { text: string; isCorrect: boolean };
type QuestionDoc = { text: string; answers: AnswerDoc[] };

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    await dbConnect();

    // 1. Read the submitted form data.
    const formData = await req.formData();
    const studentName = (formData.get("studentName") as string)?.trim();

    if (!studentName) {
      return NextResponse.json(
        { error: "Введите имя и фамилию" },
        { status: 400 }
      );
    }

    // answers[<questionIndex>] -> selected option index
    const answers = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => key.startsWith("answers["))
        .map(([key, value]) => [
          key.replace("answers[", "").replace("]", ""),
          value,
        ])
    );

    // 2. Find the test.
    const test = await Test.findOne({ slug });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // 3. Count correct answers.
    let correctCount = 0;
    (test.questions as QuestionDoc[]).forEach((q, idx) => {
      const selectedIdx = Number(answers[idx]);
      if (q.answers[selectedIdx]?.isCorrect) correctCount++;
    });

    const total = test.questions.length;
    const grade = calculateGrade(correctCount, total);

    // 4. Persist the submission.
    await Submission.create({
      test: test._id,
      studentName,
      answers: Object.entries(answers).map(([qIdx, aIdx]) => ({
        questionIndex: Number(qIdx),
        selectedOptionIndex: Number(aIdx),
      })),
      score: correctCount,
      total,
      grade,
    });

    // 5. Redirect to the result page. Status 303 turns the POST into a GET.
    //    A relative Location keeps the student on the host they came from and
    //    avoids leaking the server's internal bind address (e.g. 0.0.0.0).
    const query = new URLSearchParams({
      grade: String(grade),
      total: String(total),
      correct: String(correctCount),
      name: studentName,
    });

    return new NextResponse(null, {
      status: 303,
      headers: { Location: `/result?${query.toString()}` },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
