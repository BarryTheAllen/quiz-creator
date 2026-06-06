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

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
        <span className={styles.count}>
          Всего попыток: {submissions.length}
        </span>
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
            {submissions.map((s) => (
              <tr key={s._id.toString()}>
                <td className={styles.studname}>{s.studentName}</td>
                <td>
                  {s.score} / {s.total}
                </td>
                <td>
                  <span
                    className={styles.grade}
                    data-grade={s.grade}
                  >
                    {s.grade}
                  </span>
                </td>
                <td className={styles.date}>
                  {new Date(s.createdAt).toLocaleString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
