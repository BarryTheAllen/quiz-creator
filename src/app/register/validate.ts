import { z } from "zod";

export const RegistrationSchema = z.object({
  name: z.string().min(6, { message: "имя должно содержать минимум 6 букв" }),
  email: z.email({
    message:
      "Email должен содержать символ @ и домен (например, user@example.com)"
  }),
  password: z
    .string()
    .max(15, { message: "пароль не должен быть больше 15 символов" })
    .min(6, { message: "Пароль должен содержать как минимум 6 символов" })
    .regex(/[A-Z]/, {
      message: "Пароль должен содержать хотя бы одну заглавную букву"
    })
    .regex(/[a-z]/, {
      message: "Пароль должен содержать хотя бы одну строчную букву"
    })
    .regex(/\d/, { message: "Пароль должен содержать хотя бы одну цифру" }),
  confirmPassword: z
    .string()
    .max(15, { message: "пароль не должен больше 15 символов" })
    .min(6, { message: "Пароль должен содержать как минимум 6 символов" })
    .regex(/[A-Z]/, {
      message: "Пароль должен содержать хотя бы одну заглавную букву"
    })
    .regex(/[a-z]/, {
      message: "Пароль должен содержать хотя бы одну строчную букву"
    })
    .regex(/\d/, { message: "Пароль должен содержать хотя бы одну цифру" })
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"]
  });