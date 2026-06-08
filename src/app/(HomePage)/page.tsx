import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <span className={styles.sparkOne} />
      <span className={styles.sparkTwo} />
      <span className={styles.sparkThree} />

      <section className={styles.hero}>
        <div className={styles.content}>
          <div className={styles.badges}>
            <span>Для преподавателей</span>
            <span>Без регистрации учеников</span>
          </div>

          <h1 className={styles.title}>Создавайте тесты для своих учеников</h1>
          <p className={styles.subtitle}>
            Соберите тест из вопросов с вариантами ответов, поделитесь ссылкой,
            получите результаты и оценки в удобной таблице.
          </p>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.primary}>
              Перейти к тестам
            </Link>
            <Link href="/register" className={styles.secondary}>
              Создать аккаунт
            </Link>
          </div>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span>История: Древний мир</span>
            <strong>86%</strong>
          </div>
          <div className={styles.previewQuestion}>
            <span>Вопрос 4 из 10</span>
            <p>Какая цивилизация построила пирамиды в Гизе?</p>
          </div>
          <div className={styles.previewAnswers}>
            <span>Шумеры</span>
            <span className={styles.correct}>Египтяне</span>
            <span>Финикийцы</span>
          </div>
        </div>
      </section>

      <ol className={styles.steps}>
        <li>
          <span className={styles.stepNumber}>01</span>
          <strong>Создайте тест</strong>
          <span>Добавьте вопросы вручную или набросайте черновик через ИИ.</span>
        </li>
        <li>
          <span className={styles.stepNumber}>02</span>
          <strong>Поделитесь ссылкой</strong>
          <span>Ученики вводят имя и проходят тест без лишних аккаунтов.</span>
        </li>
        <li>
          <span className={styles.stepNumber}>03</span>
          <strong>Смотрите результаты</strong>
          <span>Оценки можно показывать в баллах, буквах или процентах.</span>
        </li>
      </ol>
    </main>
  );
}
