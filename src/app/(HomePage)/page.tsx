import styles from "./page.module.css";

export default function Home() {
  return (
      <main className={styles.hero}>
      <h1 className={styles.title}>Создавайте тесты для своих учеников</h1>
      <p className={styles.subtitle}>
        Соберите тест из вопросов с вариантами ответов, поделитесь ссылкой — и
        ученики пройдут его без регистрации. А вы увидите результаты и оценки.
      </p>

      <ol className={styles.steps}>
        <li>
          <strong>1. Создайте тест</strong>
          <span>Добавьте вопросы и отметьте правильные ответы.</span>
        </li>
        <li>
          <strong>2. Поделитесь ссылкой</strong>
          <span>Ученики вводят имя и проходят тест.</span>
        </li>
        <li>
          <strong>3. Смотрите результаты</strong>
          <span>Оценки считаются автоматически.</span>
        </li>
      </ol>
    </main>
  )
}