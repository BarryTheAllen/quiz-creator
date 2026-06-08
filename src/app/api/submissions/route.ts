import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import Submission from "@/lib/models/submissionSchema";
import { calculateGrade } from "@/utils/calculateGrade";

type TestQuestion = {
  answers: { isCorrect: boolean }[];
};

export async function POST(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const formData = await req.formData();
  const studentName = String(formData.get("studentName") ?? "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Не указан тест" }, { status: 400 });
  }

  if (!studentName) {
    return NextResponse.json({ error: "Введите имя и фамилию" }, { status: 400 });
  }

  await dbConnect();

  const test = await Test.findOne({ slug }).select("questions");
  if (!test) {
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
  }

  const answers = (test.questions as TestQuestion[]).map((question, index) => {
    const answerValue = formData.get(`answers[${index}]`);
    const selectedOptionIndex = answerValue === null ? -1 : Number(answerValue);

    return {
      questionIndex: index,
      selectedOptionIndex,
      isCorrect: Boolean(question.answers[selectedOptionIndex]?.isCorrect),
    };
  });

  const score = answers.filter((answer) => answer.isCorrect).length;
  const total = test.questions.length;
  const grade = calculateGrade(score, total);

  await Submission.create({
    test: test._id,
    studentName,
    answers: answers.map(({ questionIndex, selectedOptionIndex }) => ({
      questionIndex,
      selectedOptionIndex,
    })),
    score,
    total,
    grade,
  });

  const query = new URLSearchParams({
    grade: String(grade),
    total: String(total),
    correct: String(score),
    name: studentName,
  });

  return NextResponse.redirect(new URL(`/result?${query}`, req.url), 303);
}
