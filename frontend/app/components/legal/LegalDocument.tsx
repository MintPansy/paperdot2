import type { LegalBlock, LegalDocumentConfig } from "@/app/content/legalTypes";
import { renderInlineBold } from "@/app/components/legal/inlineBold";
import styles from "./LegalDocument.module.css";

function renderBlock(block: LegalBlock, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={index} className={styles.h2}>
          {renderInlineBold(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className={styles.h3}>
          {renderInlineBold(block.text)}
        </h3>
      );
    case "p":
      return (
        <p key={index} className={styles.p}>
          {renderInlineBold(block.text)}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className={`${styles.list} ${styles.ul}`}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInlineBold(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className={`${styles.list} ${styles.ol}`}>
          {block.items.map((item, j) => (
            <li key={j}>{renderInlineBold(item)}</li>
          ))}
        </ol>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

export type LegalDocumentProps = {
  config: LegalDocumentConfig;
  /** 본문 블록이 없을 때(예: 원문 미반영) 안내 문구 */
  emptyFallback?: {
    message: string;
    email: string;
  };
};

export default function LegalDocument({ config, emptyFallback }: LegalDocumentProps) {
  const hasBody = config.blocks.length > 0;

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <article className={styles.card}>
          <header className={styles.header}>
            <h1 className={`${styles.title} font-landing-display`}>{config.pageTitle}</h1>
            {config.lead.map((line, i) => (
              <p key={i} className={styles.lead}>
                {renderInlineBold(line)}
              </p>
            ))}
          </header>

          <div className={styles.body}>
            {!hasBody && emptyFallback ? (
              <>
                <p className={styles.fallback}>{emptyFallback.message}</p>
                <p className={styles.contact}>
                  <a href={`mailto:${emptyFallback.email}`}>
                    문의: {emptyFallback.email}
                  </a>
                </p>
              </>
            ) : (
              config.blocks.map((block, i) => renderBlock(block, i))
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
