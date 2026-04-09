"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { splitMathSegments, type MathSegment } from "./mathSegments";

const UNICODE_MATH_HINT_RE =
  /[∑∫√∞≤≥≈≠→←↔αβγδθλμνπρσφωℏ⟨⟩]/;

// LaTeX 커맨드가 있는데 $...$ 같은 구분자가 없는 경우를 보정하기 위한 힌트
const LATEX_CMD_HINT_RE =
  /\\[A-Za-z]+|\\\||\^\{[^}]*\}|_\{[^}]*\}/;

const MATH_TOKEN_RE =
  /(\\sum|\\int|\\frac|\\langle|\\rangle|\\sqrt|\\lim|\\to|\\infty|\\left|\\right|\\[A-Za-z]+|\|[A-Za-z][^|]{0,40}\\rangle|\^[A-Za-z0-9({\\]|_[A-Za-z0-9({\\])/g;
const COMPLEX_MATH_RE =
  /(\\sum|\\int|\\frac|\\langle|\\rangle|\\lim|\\sqrt|\|[A-Za-z][^|]{0,40}\\rangle|\\left|\\right)/;

type Span = { start: number; end: number };

function mergeNearbySpans(spans: Span[], maxGap = 8): Span[] {
  if (spans.length === 0) return spans;
  spans.sort((a, b) => a.start - b.start);
  const merged: Span[] = [spans[0]];
  for (let i = 1; i < spans.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = spans[i];
    if (cur.start <= prev.end + maxGap) {
      prev.end = Math.max(prev.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function expandSpan(s: string, span: Span): Span {
  const allowed = /[A-Za-z0-9_|\\^{}()[\]\-+*/=.,:;'<>\s]/;
  let start = span.start;
  let end = span.end;

  while (start > 0 && allowed.test(s[start - 1] ?? "")) {
    // 문장 시작/강한 구분자에서 멈춰 과도한 확장을 방지
    const ch = s[start - 1];
    if (ch === "\n") break;
    start--;
  }

  while (end < s.length && allowed.test(s[end] ?? "")) {
    const ch = s[end];
    // 다음 문장으로 번지는 것 방지
    if (ch === "\n") break;
    end++;
  }

  // 양 끝 공백/구두점 정리
  while (start < end && /\s/.test(s[start] ?? "")) start++;
  while (end > start && /\s/.test(s[end - 1] ?? "")) end--;
  while (end > start && /[.,;:!?]/.test(s[end - 1] ?? "")) end--;

  return { start, end };
}

function autoWrapMathSpans(input: string): string {
  const spans: Span[] = [];
  const normalized = input;
  for (const m of normalized.matchAll(MATH_TOKEN_RE)) {
    if (m.index == null) continue;
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  if (spans.length === 0) return input;

  const merged = mergeNearbySpans(spans).map((sp) => expandSpan(normalized, sp));
  const filtered = merged.filter((sp) => sp.end - sp.start >= 3);
  if (filtered.length === 0) return input;

  let out = "";
  let pos = 0;
  for (const sp of filtered) {
    if (sp.start < pos) continue;
    out += normalized.slice(pos, sp.start);
    const body = normalized.slice(sp.start, sp.end).trim();
    if (!body) {
      out += normalized.slice(sp.start, sp.end);
      pos = sp.end;
      continue;
    }
    // 복잡한 수식은 block으로 분리해 파싱 안정성과 가독성을 높임
    const blockLike =
      body.length > 90 ||
      COMPLEX_MATH_RE.test(body) ||
      body.includes("\n");
    out += blockLike ? `$$${body}$$` : `$${body}$`;
    pos = sp.end;
  }
  out += normalized.slice(pos);
  return out;
}

function normalizeUnicodeMathToLatex(input: string): string {
  if (!input) return input;

  // 1) 유니코드 수학 기호를 LaTeX로 치환 (구분자 유무와 관계없이 항상 적용)
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

  // 이미 LaTeX 구분자가 있으면 auto-wrap 건너뜀
  // (복잡한 inline → block 업그레이드는 upgradeComplexInlineMath에서 처리)
  if (s.includes("$") || s.includes("\\(") || s.includes("\\[")) {
    return s;
  }

  const hasUnicodeMath = UNICODE_MATH_HINT_RE.test(s);
  const hasLatexCmd = LATEX_CMD_HINT_RE.test(s);
  if (!hasUnicodeMath && !hasLatexCmd) {
    return s;
  }

  // 2) 구분자 없는 LaTeX 패턴 구간을 자동 탐지해 inline/block 구분자로 감싸기
  return autoWrapMathSpans(s);
}

/**
 * 파싱된 세그먼트에서 복잡한 inline 수식을 block으로 업그레이드합니다.
 * \sum, \int, \frac, \langle, \rangle, |k\rangle 등 복잡한 연산자가 포함된
 * $...$ inline 수식은 $$...$$ block으로 변환해 렌더링 안정성을 높입니다.
 */
function upgradeComplexInlineMath(segments: MathSegment[]): MathSegment[] {
  return segments.map((seg) => {
    if (
      seg.kind === "math" &&
      !seg.displayMode &&
      (COMPLEX_MATH_RE.test(seg.value) || seg.value.trim().length > 60)
    ) {
      return { ...seg, displayMode: true };
    }
    return seg;
  });
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

function InlineMath({
  latex,
}: {
  latex: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: (code) =>
          code === "unicodeTextInMathMode" || code === "mathVsTextUnits"
            ? "ignore"
            : "warn",
      });
    } catch {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
      });
    }
  }, [latex]);

  return (
    <span
      className="inline-block align-baseline mx-0.5 max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BlockMath({
  latex,
}: {
  latex: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: (code) =>
          code === "unicodeTextInMathMode" || code === "mathVsTextUnits"
            ? "ignore"
            : "warn",
      });
    } catch {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
      });
    }
  }, [latex]);

  // <p> 내부에서도 깨지지 않도록 span(block display)로 렌더링
  // my-3: 앞뒤 텍스트와 자연스러운 여백, py-1: 수식 자체 패딩
  return (
    <span
      className="block w-full my-3 py-1 overflow-x-auto text-center"
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
      return seg.displayMode ? (
        <BlockMath key={`m-${idx}`} latex={seg.value} />
      ) : (
        <InlineMath key={`m-${idx}`} latex={seg.value} />
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
  // null/undefined 방어: 렌더링 skip
  const safeText = text ?? "";
  const normalized = useMemo(() => normalizeUnicodeMathToLatex(safeText), [safeText]);
  const rawSegments = useMemo(
    () => (normalized ? splitMathSegments(normalized) : []),
    [normalized]
  );
  const segments = useMemo(() => upgradeComplexInlineMath(rawSegments), [rawSegments]);
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
