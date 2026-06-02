import styles from './Header.module.css';
import Link from 'next/link';

const Header = ({  }) => {
  return (
    <header className={styles.header}>
        <h1 className={styles.logo}>Quiz creator</h1>
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                <li className={styles.navItem}><Link href="/dashboard" className={styles.navLink}>Tests</Link></li>
                <li className={styles.navItem}><Link href="/login" className={styles.navLink}>Login</Link></li>
            </ul>
        </nav>
    </header>
  );
};

export default Header;