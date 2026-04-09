"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitMathSegments, type MathSegment } from "./mathSegments";

function renderSearchHighlights(
  text: string,
  query: string,
  markClass: string,
  markActiveClass: string,
  isActive: boolean
): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={isActive ? markActiveClass : markClass}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function KaTeXBlock({
  latex,
  displayMode,
}: {
  latex: string;
  displayMode: boolean;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode,
        throwOnError: false,
        strict: (code) =>
          code === "unicodeTextInMathMode" || code === "mathVsTextUnits"
            ? "ignore"
            : "warn",
      });
    } catch {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      });
    }
  }, [latex, displayMode]);

  if (displayMode) {
    return (
      <span
        className="inline-block w-full text-center my-1"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="inline-block align-baseline mx-0.5 max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderSegments(
  segments: MathSegment[],
  searchQuery: string | undefined,
  markClass: string,
  markActiveClass: string,
  isSearchActive: boolean
): ReactNode {
  return segments.map((seg, idx) => {
    if (seg.kind === "math") {
      return (
        <KaTeXBlock
          key={`m-${idx}`}
          latex={seg.value}
          displayMode={seg.displayMode}
        />
      );
    }
    return (
      <span key={`t-${idx}`}>
        {searchQuery?.trim()
          ? renderSearchHighlights(
              seg.value,
              searchQuery,
              markClass,
              markActiveClass,
              isSearchActive
            )
          : seg.value}
      </span>
    );
  });
}

export type MixedTextWithMathProps = {
  text: string;
  /** 검색 하이라이트용 (비어 있으면 수식만 분리 렌더) */
  searchQuery?: string;
  isSearchActive?: boolean;
  markClassName: string;
  markActiveClassName: string;
};

/**
 * 문장 단위 본문에서 $...$, $$...$$, \\(...\\), \\[...\\] 구간을 KaTeX로 렌더링합니다.
 */
export default function MixedTextWithMath({
  text,
  searchQuery,
  isSearchActive = false,
  markClassName,
  markActiveClassName,
}: MixedTextWithMathProps) {
  const segments = useMemo(() => splitMathSegments(text), [text]);
  return (
    <>
      {renderSegments(
        segments,
        searchQuery,
        markClassName,
        markActiveClassName,
        isSearchActive
      )}
    </>
  );
}
