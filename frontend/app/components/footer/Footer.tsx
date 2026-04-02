// Footer.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 1줄: 로고 */}
        <div className={styles.logoSection}>
          <Image
            src="/newlogo3.png"
            alt="ScholarDot"
            width={350}
            height={150}
            className={styles.logoImage}
            sizes="350px"
          />
        </div>

        {/* 2줄: 링크 | 저작권 | 이메일 */}
        <div className={styles.contentSection}>
          <div className={styles.linkGroup}>
            <Link
              href="https://www.notion.so/ScholarDot-32d844e3f946802eb7b5dd734df178f6?source=copy_link"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              prefetch={false}>
              개인정보처리방침
            </Link>
            <span className={styles.divider}>|</span>
            <Link
              href="https://www.notion.so/ScholarDot-32d844e3f94680faa215c1bcae9c889b?source=copy_link"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              prefetch={false}>
              이용약관
            </Link>
          </div>

          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} ScholarDot. All rights reserved.
            </p>
          </div>

          <div className={styles.emailSection}>
            <a href="contact.scholardot@gmail.com" className={styles.email}>
              문의: contact.scholardot@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
