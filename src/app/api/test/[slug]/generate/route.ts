import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/auth/nextAuth";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";

type RouteParams = { params: Promise<{ slug: string }> };

type GeneratedResponse = {
  questions: {
    text: string;
    answers: { text: string; isCorrect: boolean }[];
  }[];
};

function getOutputText(data: unknown) {
  const response = data as {
    choices?: { message?: { content?: string } }[];
  };

  return response.choices?.[0]?.message?.content;
}

function getDeepSeekError(data: unknown) {
  const response = data as { error?: { message?: string } };
  return response.error?.message ?? "DeepSeek не смог сгенерировать вопросы";
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Добавьте DEEPSEEK_API_KEY в .env, чтобы включить генерацию" },
      { status: 501 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim();
  const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);
  const difficulty = String(body.difficulty ?? "Средний");

  if (!topic) {
    return NextResponse.json({ error: "Введите тему теста" }, { status: 400 });
  }

  await dbConnect();

  const test = await Test.findOne({ slug }).select("creator");
  if (!test) {
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
  }

  if (test.creator.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let response: Response;

  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content:
              'Ты помогаешь преподавателю создать школьный тест. Возвращай только валидный json формата {"questions":[{"text":"...","answers":[{"text":"...","isCorrect":true}]}]}.',
          },
          {
            role: "user",
            content: `Сгенерируй ${count} вопросов по теме "${topic}". Сложность: ${difficulty}. У каждого вопроса должно быть 4 варианта ответа и ровно один правильный. Верни только json.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Не удалось подключиться к DeepSeek" },
      { status: 502 }
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      { error: getDeepSeekError(data) },
      { status: 502 }
    );
  }

  const outputText = getOutputText(data);
  if (!outputText) {
    return NextResponse.json(
      { error: "DeepSeek вернул пустой ответ" },
      { status: 502 }
    );
  }

  try {
    const generated = JSON.parse(outputText) as GeneratedResponse;
    return NextResponse.json(generated);
  } catch {
    return NextResponse.json(
      { error: "DeepSeek вернул ответ в неверном формате" },
      { status: 502 }
    );
  }
}
