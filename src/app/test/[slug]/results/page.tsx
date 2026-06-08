import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextAuth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import Submission from "@/lib/models/submissionSchema";
import styles from "./Results.module.css";

type TestDoc = {
  _id: { toString: () => string };
  title: string;
  creator: { toString: () => string };
};

type SubmissionRow = {
  _id: { toString: () => string };
  studentName: string;
  score: number;
  total: number;
  grade: number;
  createdAt: string;
};

type GradeScale = "ru" | "letters" | "percent";

function getGradeView(submission: SubmissionRow, scale: GradeScale) {
  const percent =
    submission.total > 0
      ? Math.round((submission.score / submission.total) * 100)
      : 0;

  if (scale === "percent") {
    return { value: `${percent}%`, tone: submission.grade };
  }

  if (scale === "letters") {
    if (percent >= 90) return { value: "A", tone: 5 };
    if (percent >= 80) return { value: "B", tone: 4 };
    if (percent >= 70) return { value: "C", tone: 3 };
    if (percent >= 60) return { value: "D", tone: 3 };
    return { value: "E", tone: 2 };
  }

  return { value: String(submission.grade), tone: submission.grade };
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ scale?: string }>;
}) {
  const { slug } = await params;
  const { scale: scaleParam } = await searchParams;
  const scale: GradeScale =
    scaleParam === "letters" || scaleParam === "percent" ? scaleParam : "ru";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const test = (await Test.findOne({ slug }).lean()) as TestDoc | null;
  if (!test) notFound();
  if (test.creator.toString() !== session.user.id) redirect("/dashboard");

  const submissions = (await Submission.find({ test: test._id })
    .sort({ createdAt: -1 })
    .lean()) as SubmissionRow[];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href={`/test/${slug}/edit`} className={styles.back}>
            ← К редактированию
          </Link>
          <h1 className={styles.title}>Результаты: {test.title}</h1>
        </div>
        <div className={styles.headerTools}>
          <form className={styles.scaleForm}>
            <label className={styles.scaleLabel} htmlFor="grade-scale">
              Шкала
            </label>
            <select
              id="grade-scale"
              name="scale"
              className={styles.scaleSelect}
              defaultValue={scale}
            >
              <option value="ru">2 / 3 / 4 / 5</option>
              <option value="letters">A / B / C / D / E</option>
              <option value="percent">Проценты</option>
            </select>
            <button className={styles.applyBtn} type="submit">
              Показать
            </button>
          </form>
          <span className={styles.count}>
            Всего попыток: {submissions.length}
          </span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <p className={styles.empty}>
          Пока никто не прошёл тест. Поделитесь ссылкой с учениками.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ученик</th>
              <th>Результат</th>
              <th>Оценка</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const gradeView = getGradeView(s, scale);

              return (
                <tr key={s._id.toString()}>
                  <td className={styles.studentName}>{s.studentName}</td>
                  <td>
                    {s.score} / {s.total}
                  </td>
                  <td>
                    <span className={styles.grade} data-grade={gradeView.tone}>
                      {gradeView.value}
                    </span>
                  </td>
                  <td className={styles.date}>
                    {new Date(s.createdAt).toLocaleString("ru-RU")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
