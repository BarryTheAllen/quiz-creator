"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";
import { IAnswer, IQuestion, ITest } from "./types";

const MAX_QUESTIONS = 25;
const MAX_ANSWERS = 5;

interface ITestEditorProps {
  test: ITest;
}

const emptyAnswer = (): IAnswer => ({ text: "", isCorrect: false });
const emptyQuestion = (): IQuestion => ({
  text: "",
  answers: [emptyAnswer(), emptyAnswer()],
});

export default function TestEditor({ test }: ITestEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(test.title);
  const [questions, setQuestions] = useState(test.questions);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    setQuestions([...questions, emptyQuestion()]);
  };

  const deleteQuestion = (question: IQuestion) => {
    setQuestions(prev => prev.filter(q => (q.text !== question.text)))
  }

  const addAnswer = (questionIndex: number) => {
    setQuestions(
      questions.map((question, index) => {
        if (index !== questionIndex || question.answers.length >= MAX_ANSWERS) {
          return question;
        }

        return {
          ...question,
          answers: [...question.answers, emptyAnswer()],
        };
      })
    );
  };

  const saveTest = async () => {
    setIsSaving(true);

    await fetch("/api/tests/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: test.slug,
        title,
        questions,
      }),
    });

    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className={styles.form}>
      <div className={styles.section}>
        <label className={styles.label} htmlFor="title">
          Название теста
        </label>
        <input
          id="title"
          className={styles.input}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Название теста"
        />
      </div>

      <div className={styles.questions}>
        {questions.length === 0 && (
          <div className={styles.empty}>В этом тесте пока нет вопросов.</div>
        )}

        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <div className={styles.questionTitle}>Вопрос {questionIndex + 1}</div>
              <button onClick={() => deleteQuestion(question)}>Удалить вопрос</button>
              <button
                className={`${styles.button} ${styles.smallButton}`}
                type="button"
                onClick={() => addAnswer(questionIndex)}
                disabled={question.answers.length >= MAX_ANSWERS}
              >
                Добавить ответ
              </button>
            </div>

            <input
              className={styles.input}
              type="text"
              value={question.text}
              onChange={(event) =>
                setQuestions(
                  questions.map((currentQuestion, index) =>
                    index === questionIndex
                      ? { ...currentQuestion, text: event.target.value }
                      : currentQuestion
                  )
                )
              }
              placeholder="Вопрос"
            />

            <div className={styles.answers}>
              {question.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className={styles.answerRow}>
                  <input
                    className={styles.input}
                    type="text"
                    value={answer.text}
                    onChange={(event) =>
                      setQuestions(
                        questions.map((currentQuestion, index) =>
                          index === questionIndex
                            ? {
                                ...currentQuestion,
                                answers: currentQuestion.answers.map(
                                  (currentAnswer, currentAnswerIndex) =>
                                    currentAnswerIndex === answerIndex
                                      ? { ...currentAnswer, text: event.target.value }
                                      : currentAnswer
                                ),
                              }
                            : currentQuestion
                        )
                      )
                    }
                    placeholder="Ответ"
                  />
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(event) =>
                        setQuestions(
                          questions.map((currentQuestion, index) =>
                            index === questionIndex
                              ? {
                                  ...currentQuestion,
                                  answers: currentQuestion.answers.map(
                                    (currentAnswer, currentAnswerIndex) =>
                                      currentAnswerIndex === answerIndex
                                        ? {
                                            ...currentAnswer,
                                            isCorrect: event.target.checked,
                                          }
                                        : currentAnswer
                                  ),
                                }
                              : currentQuestion
                          )
                        )
                      }
                    />
                    Верный
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.button} type="button" onClick={saveTest}>
          {isSaving ? "Сохраняю..." : "Сохранить"}
        </button>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          type="button"
          onClick={addQuestion}
          disabled={questions.length >= MAX_QUESTIONS}
        >
          Добавить вопрос
        </button>
      </div>
    </div>
  );
}
