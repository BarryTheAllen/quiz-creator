"use client";
import Link from 'next/link';
import styles from './Register.module.css';
import { useForm } from 'react-hook-form';

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const Component = () => {
    const {handleSubmit, register} = useForm<RegisterFormData>();
    const registerUser = async (registerData: RegisterFormData) => {
        try {            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });
            if (response.ok) {
                // Handle successful registration, e.g., redirect to login page
            } else {
                // Handle registration error, e.g., show error message
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    }
  return (
    <form className={styles.form} onSubmit={handleSubmit(registerUser)}>
      <input type="text" placeholder='Name' className={styles.input} {...register('name')} />
      <input type="email" placeholder="Email" className={styles.input} {...register('email')} />
      <input type="password" placeholder="Password" className={styles.input} {...register('password')} />
      <input type="password" placeholder="Confirm Password" className={styles.input} {...register('confirmPassword')} />
      <button type="submit" className={styles.button}>Register</button>
      <Link href="/login" className={styles.link}>
        Already have an account? Login
      </Link>
    </form>
  );
};

export default Component;
