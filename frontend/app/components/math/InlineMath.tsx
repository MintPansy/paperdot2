"use client";

import { memo, useState } from "react";
import styles from "./mathViewer.module.css";
import { useMathRenderer } from "@/app/hooks/useMathRenderer";

type Props = {
  latex: string;
};

function InlineMathComponent({ latex }: Props) {
  const html = useMathRenderer(latex, { displayMode: false });
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={styles.inlineWrap}
      onMouseEnter={() => setShowCode(true)}
      onMouseLeave={() => setShowCode(false)}
    >
      <span
        className={styles.mathContainerInline}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={copy}>
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      {showCode && <span className={styles.hoverCode}>{latex}</span>}
    </div>
  );
}

const InlineMath = memo(InlineMathComponent);
export default InlineMath;
