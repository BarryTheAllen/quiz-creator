"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Register.module.css";
import { useForm } from "react-hook-form";
import { RegistrationSchema } from "./validate";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

type RegisterData = z.infer<typeof RegistrationSchema>;

const Component = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register, formState: {errors} } = useForm<RegisterData>({resolver: zodResolver(RegistrationSchema)});

  const registerUser = async (registerData: RegisterData) => {
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
    <form className={styles.form} onSubmit={handleSubmit(registerUser)} noValidate>
      <h1 className={styles.heading}>Регистрация преподавателя</h1>
      <input
        type="text"
        placeholder="Имя"
        className={styles.input}
        {...register("name")}
      />
      {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      <input
        type="email"
        placeholder="Email"
        className={styles.input}
        {...register("email")}
      />
      {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      <input
        type="password"
        placeholder="Пароль"
        className={styles.input}
        {...register("password")}
      />
      {errors.password && <p className={styles.error}>{errors.password.message}</p>}
      <input
        type="password"
        placeholder="Повторите пароль"
        className={styles.input}
        {...register("confirmPassword")}
      />
      {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}
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
