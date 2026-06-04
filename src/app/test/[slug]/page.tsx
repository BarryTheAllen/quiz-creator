import { notFound } from "next/navigation";
import dbConnect from "@/lib/db/mongoose";
import Test from "@/lib/models/testSchema";
import styles from "./Test.module.css";

type StudentTest = {
  title: string;
  slug: string;
  questions: {
    text: string;
    answers: { text: string }[];
  }[];
};

export default async function TestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await dbConnect();
  const test = (await Test.findOne({ slug })
    .select("title slug questions.text questions.answers.text")
    .lean()) as StudentTest | null;

  if (!test) notFound();

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{test.title}</h1>

      {test.questions.length === 0 ? (
        <p className={styles.empty}>В этом тесте пока нет вопросов.</p>
      ) : (
        <form
          className={styles.form}
          action={`/api/submissions?slug=${slug}`}
          method="post"
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="studentName">
              Имя и фамилия
            </label>
            <input
              id="studentName"
              name="studentName"
              placeholder="Иван Иванов"
              required
              className={styles.input}
            />
          </div>

          {test.questions.map((q, qIndex) => (
            <fieldset key={qIndex} className={styles.question}>
              <legend className={styles.questionText}>
                {qIndex + 1}. {q.text}
              </legend>

              {q.answers.map((a, aIndex) => (
                <label key={aIndex} className={styles.answer}>
                  <input
                    type="radio"
                    name={`answers[${qIndex}]`}
                    value={aIndex}
                    required
                    className={styles.radio}
                  />
                  <span>{a.text}</span>
                </label>
              ))}
            </fieldset>
          ))}

          <button type="submit" className={styles.submit}>
            Отправить ответы
          </button>
        </form>
      )}
    </main>
  );
}
