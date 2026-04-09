"use client";

import { useMemo } from "react";
import styles from "./mathViewer.module.css";
import InlineMath from "./InlineMath";
import EquationBlock from "./EquationBlock";
import { parseLatexDocument } from "@/app/utils/latexParser";

type Props = {
  source: string;
};

export default function LatexViewer({ source }: Props) {
  const nodes = useMemo(() => parseLatexDocument(source), [source]);

  return (
    <section className={styles.viewer} aria-label="latex-viewer">
      {nodes.map((node, idx) => {
        if (node.type === "section") {
          return (
            <h2 key={`sec-${idx}`} className={styles.sectionTitle}>
              {node.title}
            </h2>
          );
        }
        if (node.type === "equation") {
          return (
            <EquationBlock
              key={`eq-${node.number}-${idx}`}
              latex={node.latex}
              number={node.number}
            />
          );
        }
        if (node.type === "inline") {
          return <InlineMath key={`in-${idx}`} latex={node.latex} />;
        }
        return (
          <p key={`tx-${idx}`} className={styles.textRow}>
            {node.text}
          </p>
        );
      })}
    </section>
  );
}
