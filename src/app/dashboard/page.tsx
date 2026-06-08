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

export default async function DashBoard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const tests = (await Test.find({
    creator: session.user.id,
    ...(query
      ? {
          title: {
            $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            $options: "i",
          },
        }
      : {}),
  })
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
        <div>
          <h1 className={styles.title}>Мои тесты</h1>
          <p className={styles.subtitle}>
            Управляйте тестами, редактируйте вопросы и смотрите результаты.
          </p>
        </div>
        <form action={createTest}>
          <button type="submit" className={styles.createBtn}>
            + Создать тест
          </button>
        </form>
      </div>

      <form className={styles.searchForm}>
        <label className={styles.searchLabel} htmlFor="test-search">
          Поиск тестов
        </label>
        <div className={styles.searchRow}>
          <input
            id="test-search"
            name="q"
            type="search"
            defaultValue={query}
            className={styles.searchInput}
            placeholder="Введите название теста"
          />
          <button type="submit" className={styles.searchBtn}>
            Найти
          </button>
          {query && (
            <Link href="/dashboard" className={styles.clearBtn}>
              Сбросить
            </Link>
          )}
        </div>
      </form>

      {tests.length > 0 ? (
        <ul className={styles.testsGrid}>
          {tests.map((test) => (
            <li key={test._id.toString()} className={styles.testCard}>
              <div className={styles.testInfo}>
                <h3 className={styles.testTitle}>{test.title}</h3>
                <span className={styles.testDesc}>
                  Вопросов: {test.questions.length}
                </span>
              </div>
              <div className={styles.testActions}>
                <Link
                  href={`/test/${test.slug}/results`}
                  className={styles.resultsBtn}
                >
                  Результаты
                </Link>
                <Link
                  href={`/test/${test.slug}/edit`}
                  className={styles.editBtn}
                >
                  Редактировать
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          <p>
            {query
              ? "По этому запросу тесты не найдены."
              : "У вас пока ещё нет тестов."}
          </p>
          <span>
            {query
              ? "Попробуйте изменить название в поиске."
              : "Нажмите «Создать тест», чтобы начать."}
          </span>
        </div>
      )}
    </main>
  );
}
