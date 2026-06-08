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
type GenerateStatus = "idle" | "generating" | "error";

type GeneratedQuestion = {
  text: string;
  answers: { text: string; isCorrect: boolean }[];
};

const uid = () => crypto.randomUUID();

const TestForm = ({ slug, initialData }: TestFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");
  const [generateError, setGenerateError] = useState("");
  const [copied, setCopied] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("Средний");

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

  const handleGenerate = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      setGenerateError("Введите тему теста");
      setGenerateStatus("error");
      return;
    }

    setGenerateError("");
    setGenerateStatus("generating");

    try {
      const res = await fetch(`/api/test/${slug}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          count: aiCount,
          difficulty: aiDifficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error ?? "Не удалось сгенерировать вопросы");
        setGenerateStatus("error");
        return;
      }

      const generatedQuestions = (data.questions as GeneratedQuestion[]).map(
        (question) => ({
          id: uid(),
          text: question.text,
          answers: question.answers.map((answer) => ({
            id: uid(),
            text: answer.text,
            isCorrect: answer.isCorrect,
          })),
        })
      );

      setQuestions((prev) => [...prev, ...generatedQuestions]);
      if (title.trim() === "Новый тест") setTitle(topic);
      setGenerateStatus("idle");
    } catch {
      setGenerateError("Не удалось подключиться к генератору");
      setGenerateStatus("error");
    }
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

      <section className={styles.aiPanel}>
        <div>
          <h2 className={styles.aiTitle}>Сгенерировать вопросы</h2>
          <p className={styles.aiText}>
            Добавьте черновик вопросов по теме, а затем отредактируйте ответы.
          </p>
        </div>
        <div className={styles.aiGrid}>
          <label className={styles.aiField}>
            <span>Тема</span>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Например: Древний Египет"
            />
          </label>
          <label className={styles.aiField}>
            <span>Вопросов</span>
            <input
              type="number"
              min="1"
              max="10"
              value={aiCount}
              onChange={(e) => setAiCount(Number(e.target.value))}
            />
          </label>
          <label className={styles.aiField}>
            <span>Сложность</span>
            <select
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value)}
            >
              <option>Лёгкий</option>
              <option>Средний</option>
              <option>Сложный</option>
            </select>
          </label>
          <button
            type="button"
            className={styles.generate}
            onClick={handleGenerate}
            disabled={generateStatus === "generating"}
          >
            {generateStatus === "generating" ? "Генерация…" : "Добавить вопросы"}
          </button>
        </div>
        {generateStatus === "error" && (
          <p className={styles.errorMsg}>{generateError}</p>
        )}
      </section>

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
