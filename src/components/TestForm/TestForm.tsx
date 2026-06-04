"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./TestForm.module.css";

type Answer = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; answers: Answer[] };

type IncomingAnswer = { id?: string; text: string; isCorrect: boolean };
type IncomingQuestion = { id?: string; text: string; answers: IncomingAnswer[] };

type TestFormProps = {
  slug: string;
  initialData: { title: string; questions: IncomingQuestion[] };
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const uid = () => crypto.randomUUID();

const TestForm = ({ slug, initialData }: TestFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(initialData.title);
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialData.questions.map((q) => ({
      id: q.id ?? uid(),
      text: q.text,
      answers: q.answers.map((a) => ({
        id: a.id ?? uid(),
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    }))
  );

  const addQuestion = () =>
    setQuestions((prev) => [
      ...prev,
      {
        id: uid(),
        text: "",
        answers: [
          { id: uid(), text: "", isCorrect: true },
          { id: uid(), text: "", isCorrect: false },
        ],
      },
    ]);

  // Удаляем по id, а не по тексту.
  const removeQuestion = (qId: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== qId));

  const setQuestionText = (qId: string, text: string) =>
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, text } : q)));

  const addAnswer = (qId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, answers: [...q.answers, { id: uid(), text: "", isCorrect: false }] }
          : q
      )
    );

  // Удаляем по id, а не по тексту.
  const removeAnswer = (qId: string, aId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, answers: q.answers.filter((a) => a.id !== aId) }
          : q
      )
    );

  const setAnswerText = (qId: string, aId: string, text: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) => (a.id === aId ? { ...a, text } : a)),
            }
          : q
      )
    );

  const toggleCorrect = (qId: string, aId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === aId ? { ...a, isCorrect: !a.isCorrect } : a
              ),
            }
          : q
      )
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch(`/api/test/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) router.refresh();
    } catch {
      setStatus("error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить тест? Все результаты учеников будут потеряны.")) return;
    const res = await fetch(`/api/test/${slug}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/test/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <div className={styles.topbar}>
        <Link href="/dashboard" className={styles.back}>
          ← К тестам
        </Link>
        <div className={styles.topActions}>
          <Link href={`/test/${slug}/results`} className={styles.linkButton}>
            Результаты учеников
          </Link>
          <button
            type="button"
            onClick={handleCopyLink}
            className={styles.linkButton}
          >
            {copied ? "Ссылка скопирована" : "Поделиться с учениками"}
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          Название теста
        </label>
        <input
          id="title"
          className={styles.titleInput}
          placeholder="Например: Контрольная по истории"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {questions.map((q, qIndex) => {
        const hasCorrect = q.answers.some((a) => a.isCorrect);
        return (
          <div key={q.id} className={styles.question}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>Вопрос {qIndex + 1}</span>
              <button
                type="button"
                className={styles.removeQuestion}
                onClick={() => removeQuestion(q.id)}
              >
                Удалить вопрос
              </button>
            </div>

            <input
              className={styles.questionInput}
              placeholder="Текст вопроса"
              value={q.text}
              onChange={(e) => setQuestionText(q.id, e.target.value)}
            />

            <div className={styles.answers}>
              {q.answers.map((a, aIndex) => (
                <div key={a.id} className={styles.answerRow}>
                  <label className={styles.correctToggle} title="Правильный ответ">
                    <input
                      type="checkbox"
                      checked={a.isCorrect}
                      onChange={() => toggleCorrect(q.id, a.id)}
                    />
                    <span>Верный</span>
                  </label>

                  <input
                    className={styles.answerInput}
                    placeholder={`Вариант ${aIndex + 1}`}
                    value={a.text}
                    onChange={(e) => setAnswerText(q.id, a.id, e.target.value)}
                  />

                  <button
                    type="button"
                    className={styles.removeAnswer}
                    onClick={() => removeAnswer(q.id, a.id)}
                    disabled={q.answers.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {!hasCorrect && (
                <p className={styles.hint}>
                  Отметьте хотя бы один правильный вариант.
                </p>
              )}

              <button
                type="button"
                className={styles.addAnswer}
                onClick={() => addAnswer(q.id)}
              >
                + Добавить вариант
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className={styles.addQuestion}
        onClick={addQuestion}
      >
        + Добавить вопрос
      </button>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <button
            type="submit"
            className={styles.save}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Сохранение…" : "Сохранить тест"}
          </button>
          {status === "saved" && (
            <span className={styles.saved}>Сохранено</span>
          )}
          {status === "error" && (
            <span className={styles.errorMsg}>Ошибка сохранения</span>
          )}
        </div>
        <button type="button" className={styles.delete} onClick={handleDelete}>
          Удалить тест
        </button>
      </div>
    </form>
  );
};

export default TestForm;
