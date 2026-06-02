"use client";
import Link from 'next/link';
import styles from './Login.module.css';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';

type LoginFormData = {
    name: string;
    email: string;
    password: string;
};

const Component = () => {
    const {handleSubmit, register} = useForm<LoginFormData>();
    
    const loginUser = async (data: LoginFormData) => {
        try {
            const response = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            });
            if (response?.ok) {
                // Handle successful login, e.g., redirect to dashboard
            } else {
                // Handle login error, e.g., show error message
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    }; 
  return (
    <form className={styles.form} onSubmit={handleSubmit(loginUser)}>
      <input type="text" placeholder='Name' className={styles.input} {...register('name')} />
      <input type="email" placeholder="Email" className={styles.input} {...register('email')} />
      <input type="password" placeholder="Password" className={styles.input} {...register('password')} />
      <button type="submit" className={styles.button}>Login</button>
      <Link href="/register" className={styles.link}>
        Don&apos;t have an account? Register
      </Link>
    </form>
  );
};

export default Component;
