"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import styles from "./TestForm.module.css";

type AnswerForm = { text: string; isCorrect: boolean };
type QuestionForm = { text: string; answers: AnswerForm[] };
type TestFormValues = { title: string; questions: QuestionForm[] };

type TestFormProps = {
  slug: string;
  initialData: TestFormValues;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const TestForm = ({ slug, initialData }: TestFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [copied, setCopied] = useState(false);

  const { register, control, handleSubmit } = useForm<TestFormValues>({
    defaultValues: {
      title: initialData.title || "",
      questions: initialData.questions || [],
    },
  });

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: "questions" });

  const onSubmit = async (data: TestFormValues) => {
    setStatus("saving");
    try {
      const res = await fetch(`/api/test/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    const url = `${window.location.origin}/test/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
          {...register("title", { required: true })}
        />
      </div>

      {questions.map((question, qIndex) => (
        <div key={question.id} className={styles.question}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>Вопрос {qIndex + 1}</span>
            <button
              type="button"
              className={styles.removeQuestion}
              onClick={() => removeQuestion(qIndex)}
            >
              Удалить вопрос
            </button>
          </div>

          <input
            className={styles.questionInput}
            placeholder="Текст вопроса"
            {...register(`questions.${qIndex}.text`, { required: true })}
          />

          <AnswerFields control={control} register={register} qIndex={qIndex} />
        </div>
      ))}

      <button
        type="button"
        className={styles.addQuestion}
        onClick={() =>
          appendQuestion({
            text: "",
            answers: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
            ],
          })
        }
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

type AnswerFieldsProps = {
  control: Control<TestFormValues>;
  register: UseFormRegister<TestFormValues>;
  qIndex: number;
};

const AnswerFields = ({ control, register, qIndex }: AnswerFieldsProps) => {
  const {
    fields: answers,
    append,
    remove,
  } = useFieldArray({ control, name: `questions.${qIndex}.answers` });

  // Live values let us warn when no correct answer is marked.
  const watchedAnswers = useWatch({
    control,
    name: `questions.${qIndex}.answers`,
  });
  const hasCorrect = watchedAnswers?.some((a) => a?.isCorrect);

  return (
    <div className={styles.answers}>
      {answers.map((answer, aIndex) => (
        <div key={answer.id} className={styles.answerRow}>
          <label className={styles.correctToggle} title="Правильный ответ">
            <input
              type="checkbox"
              {...register(`questions.${qIndex}.answers.${aIndex}.isCorrect`)}
            />
            <span>Верный</span>
          </label>

          <input
            className={styles.answerInput}
            placeholder={`Вариант ${aIndex + 1}`}
            {...register(`questions.${qIndex}.answers.${aIndex}.text`, {
              required: true,
            })}
          />

          <button
            type="button"
            className={styles.removeAnswer}
            onClick={() => remove(aIndex)}
            disabled={answers.length <= 1}
          >
            ✕
          </button>
        </div>
      ))}

      {!hasCorrect && (
        <p className={styles.hint}>Отметьте хотя бы один правильный вариант.</p>
      )}

      <button
        type="button"
        className={styles.addAnswer}
        onClick={() => append({ text: "", isCorrect: false })}
      >
        + Добавить вариант
      </button>
    </div>
  );
};

export default TestForm;
