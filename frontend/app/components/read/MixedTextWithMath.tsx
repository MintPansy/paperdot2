"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitMathSegments, type MathSegment } from "./mathSegments";

const UNICODE_MATH_HINT_RE =
  /[∑∫√∞≤≥≈≠→←↔αβγδθλμνπρσφωℏ⟨⟩]/;

function normalizeUnicodeMathToLatex(input: string): string {
  if (!input) return input;

  // 이미 LaTeX 구분자가 있으면 그대로 둠
  if (input.includes("$") || input.includes("\\(") || input.includes("\\[")) {
    return input;
  }
  if (!UNICODE_MATH_HINT_RE.test(input)) {
    return input;
  }

  // 1) 흔한 유니코드 수학 기호를 LaTeX로 치환
  let s = input
    .replaceAll("⟨", "\\langle ")
    .replaceAll("⟩", " \\rangle")
    .replaceAll("∑", "\\sum")
    .replaceAll("∫", "\\int")
    .replaceAll("√", "\\sqrt")
    .replaceAll("∞", "\\infty")
    .replaceAll("≤", "\\le")
    .replaceAll("≥", "\\ge")
    .replaceAll("≈", "\\approx")
    .replaceAll("≠", "\\ne")
    .replaceAll("→", "\\to")
    .replaceAll("←", "\\leftarrow")
    .replaceAll("↔", "\\leftrightarrow")
    // PDF 추출에서 자주 섞이는 minus 기호 정규화
    .replaceAll("−", "-");

  // 2) 문장 전체가 아니라 "식으로 보이는 구간"만 $...$로 감쌈 (휴리스틱)
  //    - 시작: '=' 또는 첫 수학 힌트 문자 근처(좌측으로 변수명/기호 포함)
  //    - 끝: 수학 힌트/기호가 끝나는 지점(우측으로 괄호/파이프/지수 등 포함)
  const startAnchor = Math.max(
    s.indexOf("="),
    s.search(UNICODE_MATH_HINT_RE)
  );
  if (startAnchor < 0) return s;

  const allowedLeft = /[A-Za-z0-9_|\\^{}()[\]\-+*/.,\s]/;
  let start = startAnchor;
  while (start > 0 && allowedLeft.test(s[start - 1] ?? "")) start--;

  const allowedRight = /[A-Za-z0-9_|\\^{}()[\]\-+*/.,\s]/;
  let end = startAnchor;
  while (end < s.length && allowedRight.test(s[end] ?? "")) end++;

  // 너무 짧으면 감싸지 않음
  if (end - start < 3) return s;

  // 문장 끝의 마침표/쉼표는 수식 밖으로 빼는 편이 안정적
  const tail = s.slice(end);
  const body = s.slice(start, end).trim();
  if (!body) return s;

  return `${s.slice(0, start)}$${body}$${tail}`;
}

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
  const normalized = useMemo(() => normalizeUnicodeMathToLatex(text), [text]);
  const segments = useMemo(() => splitMathSegments(normalized), [normalized]);
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
