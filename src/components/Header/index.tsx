import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.header}>
      <Link href="/">
        <a>
          <img src="/img/logo.svg" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
