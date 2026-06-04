"use client";

import styles from "./Header.module.css";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const Header = () => {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Quiz creator
      </Link>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {isAuthed ? (
            <>
              <li className={styles.navItem}>
                <Link href="/dashboard" className={styles.navLink}>
                  Мои тесты
                </Link>
              </li>
              <li className={styles.navItem}>
                <button
                  className={styles.logout}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className={styles.navItem}>
                <Link href="/login" className={styles.navLink}>
                  Вход
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/register" className={styles.navLink}>
                  Регистрация
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
