import Link from "next/link";
import styles from "./paperDotLogo.module.css";

type PaperDotLogoProps = {
  href?: string;
  variant?: "header" | "footer";
};

/**
 * 학술 테마 로고: "P." 아이콘 + "PaperDot" 텍스트
 * Notion / Google Scholar 느낌의 간결한 브랜딩
 */
export default function PaperDotLogo({
  href = "/",
  variant = "header",
}: PaperDotLogoProps) {
  const content = (
    <>
      <span className={styles.icon} aria-hidden>P.</span>
      <span className={styles.wordmark}>PaperDot</span>
    </>
  );

  const className = `${styles.logo} ${variant === "footer" ? styles.logoFooter : ""}`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label="PaperDot 홈으로">
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}
