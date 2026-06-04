import styles from "./Result.module.css";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    grade?: string;
    total?: string;
    correct?: string;
    name?: string;
  }>;
}) {
  const { grade, total, correct, name } = await searchParams;

  const gradeNum = Number(grade ?? 0);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Тест завершён</h1>
        {name && <p className={styles.name}>{name}</p>}

        <div className={styles.gradeBox} data-grade={gradeNum}>
          <span className={styles.gradeLabel}>Оценка</span>
          <span className={styles.grade}>{grade ?? "—"}</span>
        </div>

        <p className={styles.score}>
          Правильных ответов: <strong>{correct ?? 0}</strong> из{" "}
          <strong>{total ?? 0}</strong>
        </p>
      </div>
    </main>
  );
}
