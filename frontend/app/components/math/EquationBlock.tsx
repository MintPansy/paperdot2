"use client";

import { memo, useState } from "react";
import styles from "./mathViewer.module.css";
import { useMathRenderer } from "@/app/hooks/useMathRenderer";

type Props = {
  latex: string;
  number: number;
};

function EquationBlockComponent({ latex, number }: Props) {
  const html = useMathRenderer(latex, { displayMode: true });
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={styles.equationCard}
      onMouseEnter={() => setShowCode(true)}
      onMouseLeave={() => setShowCode(false)}
    >
      <div className={styles.equationTop}>
        <span className={styles.equationNo}>{`식 (${number})`}</span>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "코드 숨기기" : "코드 보기"}
          </button>
          <button type="button" className={styles.btn} onClick={copy}>
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>

      <div className={styles.mathContainer} dangerouslySetInnerHTML={{ __html: html }} />

      {expanded && <pre className={styles.latexCode}>{latex}</pre>}
      {!expanded && showCode && <div className={styles.hoverCode}>{latex}</div>}
    </article>
  );
}

const EquationBlock = memo(EquationBlockComponent);
export default EquationBlock;
