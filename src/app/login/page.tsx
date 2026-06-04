"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

type LoginFormData = {
  email: string;
  password: string;
};

const Component = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register } = useForm<LoginFormData>();

  const loginUser = async (data: LoginFormData) => {
    setError("");
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (response?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Неверная почта или пароль");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(loginUser)}>
      <h1 className={styles.heading}>Вход для преподавателя</h1>
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
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? "Вход…" : "Войти"}
      </button>
      <Link href="/register" className={styles.link}>
        Нет аккаунта? Зарегистрироваться
      </Link>
    </form>
  );
};

export default Component;
