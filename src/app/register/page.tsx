"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Register.module.css";
import { useForm } from "react-hook-form";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Component = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register } = useForm<RegisterFormData>();

  const registerUser = async (registerData: RegisterFormData) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const body = await response.json().catch(() => ({}));
        setError(body.message ?? "Не удалось зарегистрироваться");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(registerUser)}>
      <h1 className={styles.heading}>Регистрация преподавателя</h1>
      <input
        type="text"
        placeholder="Имя"
        className={styles.input}
        {...register("name", { required: true })}
      />
      <input
        type="email"
        placeholder="Email"
        className={styles.input}
        {...register("email", { required: true })}
      />
      <input
        type="password"
        placeholder="Пароль"
        className={styles.input}
        {...register("password", { required: true })}
      />
      <input
        type="password"
        placeholder="Повторите пароль"
        className={styles.input}
        {...register("confirmPassword", { required: true })}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? "Создание…" : "Зарегистрироваться"}
      </button>
      <Link href="/login" className={styles.link}>
        Уже есть аккаунт? Войти
      </Link>
    </form>
  );
};

export default Component;
