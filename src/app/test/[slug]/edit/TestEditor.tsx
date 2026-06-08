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

const emptyAnswer = (): IAnswer => ({ id: Date.now().toString() + Math.random().toString(36), text: "", isCorrect: false });
const emptyQuestion = (): IQuestion => ({
  id: Date.now().toString() + Math.random().toString(36),
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

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
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

  const deleteAnswer = (questionIndex: number, answerId: string) => {
    setQuestions(
      questions.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          answers: question.answers.filter(answer => answer.id !== answerId),
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
          <div key={question.id} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <div className={styles.questionTitle}>Вопрос {questionIndex + 1}</div>
              <button onClick={() => deleteQuestion(question.id)}>Удалить вопрос</button>
              <button
                className={`${styles.button} ${styles.smallButton}`}
                type="button"
                onClick={() => addAnswer(questionIndex)}
                disabled={question.answers.length >= MAX_ANSWERS}
              >
                Добавить ответ
              </button>
            </div>

            <textarea
              className={styles.questionInput}
              value={question.text}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[questionIndex].text = e.target.value;
                setQuestions(newQuestions);
              }}
              placeholder="Формулировка вопроса"
            />

            <div className={styles.answers}>
              {question.answers.map((answer, answerIndex) => (
                <div key={answer.id} className={styles.answerRow}>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[questionIndex].answers[answerIndex].text = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    placeholder={`Ответ ${answerIndex + 1}`}
                    className={styles.answerInput}
                  />
                  <label className={styles.checkboxLabel}>
                    Правильный
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[questionIndex].answers.forEach(ans => ans.isCorrect = false);
                        newQuestions[questionIndex].answers[answerIndex].isCorrect = e.target.checked;
                        setQuestions(newQuestions);
                      }}
                      className={styles.checkbox}
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.removeAnswerButton}
                    onClick={() => deleteAnswer(questionIndex, answer.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={addQuestion}
          disabled={questions.length >= MAX_QUESTIONS}
        >
          Добавить вопрос
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={saveTest}
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
