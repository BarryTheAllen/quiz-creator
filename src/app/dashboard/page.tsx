import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth/nextAuth";
import { redirect } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import styles from "./DashBoard.module.css";

type DashboardTest = {
  _id: { toString: () => string };
  title: string;
  slug: string;
  questions: unknown[];
};

export default async function DashBoard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const tests = (await Test.find({ creator: session.user.id })
    .sort({ createdAt: -1 })
    .select("title slug questions")
    .lean()) as DashboardTest[];

  const createTest = async () => {
    "use server";

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    await dbConnect();

    const slug = `${session.user.id}-${Date.now()}`;
    await Test.create({
      title: "Новый тест",
      slug,
      questions: [],
      creator: session.user.id,
    });

    redirect(`/test/${slug}/edit`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои тесты</h1>
        <form action={createTest}>
          <button className={styles.create}>+ Создать тест</button>
        </form>
      </div>

      {tests.length > 0 ? (
        <ul className={styles.list}>
          {tests.map((test) => (
            <li key={test._id.toString()} className={styles.card}>
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{test.title}</h3>
                <span className={styles.cardMeta}>
                  Вопросов: {test.questions.length}
                </span>
              </div>
              <div className={styles.cardActions}>
                <Link
                  href={`/test/${test.slug}/results`}
                  className={styles.secondary}
                >
                  Результаты
                </Link>
                <Link
                  href={`/test/${test.slug}/edit`}
                  className={styles.primary}
                >
                  Редактировать
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>У вас пока ещё нет тестов.</p>
          <span>Нажмите «Создать тест», чтобы начать.</span>
        </div>
      )}
    </main>
  );
}
