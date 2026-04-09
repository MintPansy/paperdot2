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

function mergeNearbySpans(spans: Span[], maxGap = 2): Span[] {
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

const MATH_EXTRACT_PATTERNS: RegExp[] = [
  // 1) \sum, \int, \frac 등 핵심 명령 + 뒤따르는 script/brace
  /\\(?:sum|int|frac|langle|rangle|sqrt|lim|to|infty|left|right)(?:\s*(?:_\{[^}]{0,80}\}|\^\{[^}]{0,80}\}|_[A-Za-z0-9]|[A-Za-z0-9]|\{[^}]{0,80}\}|\([^)]{0,80}\)|\[[^\]]{0,80}\]|[+\-*/=|.,])){0,40}/g,
  // 2) ket/bra 형태
  /\|[A-Za-z][A-Za-z0-9_{}\-]{0,40}\\rangle/g,
  /\\langle\s*[A-Za-z0-9_{}|\\\-\s]{0,80}\\rangle/g,
  // 3) 위첨자/아래첨자 중심 표현
  /[A-Za-z0-9]+(?:_\{[^}]{1,60}\}|_[A-Za-z0-9])(?:\^\{[^}]{1,60}\}|\^[A-Za-z0-9])?/g,
  /[A-Za-z0-9]+(?:\^\{[^}]{1,60}\}|\^[A-Za-z0-9])(?:_\{[^}]{1,60}\}|_[A-Za-z0-9])?/g,
];

function collectMathSpans(input: string): Span[] {
  const spans: Span[] = [];
  for (const re of MATH_EXTRACT_PATTERNS) {
    for (const m of input.matchAll(re)) {
      if (m.index == null) continue;
      spans.push({ start: m.index, end: m.index + m[0].length });
    }
  }
  for (const m of input.matchAll(MATH_TOKEN_RE)) {
    if (m.index == null) continue;
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  return spans;
}

function autoWrapMathSpans(input: string): string {
  const normalized = input;
  const spans = collectMathSpans(normalized);
  if (spans.length === 0) return input;

  const merged = mergeNearbySpans(spans);
  const filtered = merged.filter((sp) => {
    const body = normalized.slice(sp.start, sp.end).trim();
    if (body.length < 2) return false;
    // 단순 영어 단어만 있는 경우 제외 (문장 전체 수식화 방지)
    if (/^[A-Za-z\s]+$/.test(body)) return false;
    return true;
  });
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

    // 한글/CJK이 포함된 구간은 자동 수식 래핑 금지
    // (번역문 전체가 수식으로 오인되어 사라지는 현상 방지)
    if (/[\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u30FF]/.test(body)) {
      out += normalized.slice(sp.start, sp.end);
      pos = sp.end;
      continue;
    }

    // 길게 잡혔는데 수학 기호가 부족하면 오탐으로 보고 원문 유지
    const mathSignalCount = (
      body.match(/\\|[_^{}|=+\-*/]|∑|∫|√|⟨|⟩/g) ?? []
    ).length;
    if (body.length > 120 && mathSignalCount < 6) {
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

function isEquationLikeLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  // 이미 명시적 구분자가 있으면 그대로 둠
  if (t.includes("$$") || t.includes("$") || t.includes("\\(") || t.includes("\\[")) {
    return false;
  }
  // CJK 문장은 오탐 방지를 위해 제외
  if (/[\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u30FF]/.test(t)) return false;

  const hasLatexCmd = /\\[A-Za-z]+/.test(t);
  const hasMathOps = /[=+\-*/^_{}|<>]/.test(t);
  const hasMathGlyph = /[∑∫√∞≤≥≈≠→←↔⟨⟩]/.test(t);
  const tokenDense =
    ((t.match(/[=+\-*/^_{}|<>()[\]\\]/g) ?? []).length / Math.max(1, t.length)) >
    0.12;
  const likelyEquationNumber = /\(\d+\)\s*$/.test(t);

  // 논문 PDF 추출식에서 자주 보이는 합표기 깨짐(X, n=0 등) 보정
  const sumLike = /(?:^|\s)X(?:\s|$)|[a-zA-Z]\s*=\s*\d+/.test(t);

  return (
    hasLatexCmd ||
    hasMathGlyph ||
    likelyEquationNumber ||
    (hasMathOps && (tokenDense || sumLike))
  );
}

function wrapEquationLikeLines(input: string): string {
  return input
    .split("\n")
    .map((line) => {
      if (!isEquationLikeLine(line)) return line;
      const trimmed = line.trim();
      return `$$${trimmed}$$`;
    })
    .join("\n");
}

function normalizePdfEquationArtifacts(input: string): string {
  let s = input;

  // 03page.pdf 계열에서 자주 보이는 합 기호 깨짐: "NH-1 X n=0" / "NH-1 X n=1"
  s = s
    .replace(
      /\bN\s*H\s*-\s*1\s*X\s*n\s*=\s*0\b/g,
      "\\sum_{n=0}^{N_H-1}"
    )
    .replace(
      /\bN\s*H\s*-\s*1\s*X\s*n\s*=\s*1\b/g,
      "\\sum_{n=1}^{N_H-1}"
    );

  // 간단한 합 표기 보정: "X E" -> "\sum_E", "X n" -> "\sum_n"
  s = s
    .replace(/(?:^|\s)X\s*E(?:\s|$)/g, " \\sum_E ")
    .replace(/(?:^|\s)X\s*n(?:\s|$)/g, " \\sum_n ");

  // 인덱스/특수문자 기반 표기 보정
  s = s
    .replace(/S\s*K\s*,\s*\\infty/g, "S_{K,\\infty}")
    .replace(/S\s*K\s*,\s*∞/g, "S_{K,\\infty}")
    .replace(/Λ\s*n/g, "\\Lambda_n")
    .replace(/Λn/g, "\\Lambda_n");

  return s;
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

  s = normalizePdfEquationArtifacts(s);

  // 03page.pdf 계열처럼 수식이 줄 단위로 분리된 텍스트를 우선 block 수식으로 감쌈
  s = wrapEquationLikeLines(s);

  // 한글/CJK 문장은 자동 수식 래핑을 하지 않음.
  // 번역문 가시성을 최우선으로 보장하고, 명시적 구분자($...$, $$...$$, \(...\), \[...\])만 렌더링.
  if (/[\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u30FF]/.test(s)) {
    return s;
  }

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
 * 줄이 수식 위주인지 판단합니다.
 * 수식 줄은 spacing 보정을 skip합니다.
 */
function isMathLine(line: string): boolean {
  // LaTeX 구분자 또는 유니코드 수학 기호가 있으면 수식 줄
  if (/\$|\\[a-zA-Z]/.test(line)) return true;
  if (/[∑∫√∞⟨⟩αβγδθλμνπρσφω]/.test(line)) return true;
  // 기호 밀도 30% 이상이면 수식 줄
  const mathChars = (line.match(/[|=<>+\-*/^{}[\]()]/g) ?? []).length;
  return line.length > 0 && mathChars / line.length > 0.3;
}

/**
 * 단일 줄 텍스트에 spacing 보정을 적용합니다.
 * 수식 줄이 아닌 순수 텍스트에만 호출됩니다.
 */
function fixLineText(s: string): string {
  // ── 1. 소문자 → 대문자 경계 ──────────────────────────────
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2");

  // ── 2. 연속 대문자 → 새 단어 (약어 뒤) ──────────────────
  s = s.replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1 $2");

  // ── 3. 문자 ↔ 숫자 (단독 포함, 사용자 요청 강화) ─────────
  s = s.replace(/([a-zA-Z])(\d)/g, "$1 $2");
  s = s.replace(/(\d)([a-zA-Z])/g, "$1 $2");

  // ── 4. 괄호 앞뒤 ─────────────────────────────────────────
  s = s.replace(/([a-zA-Z])\(/g, "$1 (");
  s = s.replace(/\)([a-zA-Z])/g, ") $1");

  // ── 5. 쉼표 뒤 공백 ──────────────────────────────────────
  s = s.replace(/,([a-zA-Z\d])/g, ", $1");

  // ── 6. 접속사·전치사 단어 복구 ───────────────────────────
  //    2회 반복으로 연쇄 키워드 처리
  //    "statewiththeinitialcondition" → "state with the initial condition"
  //    Pass 1: "statewiththei" → "state withthei"
  //    Pass 2: "state withthei" → "state with thei"
  for (let _pass = 0; _pass < 2; _pass++) {
    // 키워드 앞 분리 (preceding text 와 분리) — and/or 는 오탐 위험으로 제외
    s = s.replace(
      /([a-zA-Z])(with|where|that|this|the|for|from|into|upon|each|such|also|both|then|when|thus|than)/gi,
      "$1 $2"
    );
    // 키워드 뒤 분리 — and/or 포함
    s = s.replace(
      /(with|where|that|this|the|for|from|into|upon|each|such|also|both|then|when|thus|than|and|or)([a-zA-Z])/gi,
      "$1 $2"
    );
  }

  // ── 7. 수식 기호 주변 공백 ────────────────────────────────
  //    | 기호
  s = s.replace(/([a-zA-Z\d])\|/g, "$1 |");
  s = s.replace(/\|([a-zA-Z\d])/g, "| $1");
  //    >= <= 복합 연산자: 단위 유지하며 앞뒤 공백
  s = s.replace(/([a-zA-Z\d])>=/g, "$1 >=");
  s = s.replace(/>=([a-zA-Z\d])/g, ">= $1");
  s = s.replace(/([a-zA-Z\d])<=/g, "$1 <=");
  s = s.replace(/<=([a-zA-Z\d])/g, "<= $1");
  //    = 다음 | (ket 표기: "=|k0>" → "= |k0>")
  s = s.replace(/=\|/g, "= |");
  //    단독 > (>= 처리됨, >> 유지)
  s = s.replace(/([a-zA-Z\d])>(?![=>])/g, "$1 >");
  s = s.replace(/(?<![=>])>([a-zA-Z])/g, "> $1");
  //    단독 < (<= 처리됨, << 유지)
  s = s.replace(/([a-zA-Z\d])<(?![=<])/g, "$1 <");
  s = s.replace(/(?<![=<])<([a-zA-Z\d])/g, "< $1");
  //    단독 = (>=, <=, =>, == 제외)
  s = s.replace(/([a-zA-Z\d])=(?![=><])/g, "$1 =");
  s = s.replace(/(?<![<>!=])=([a-zA-Z\d])/g, "= $1");

  // ── 8. 노이즈 제거: 단독 ^ 기호 ──────────────────────────
  //    PDF에서 상첨자가 ^ 로 남는 경우 제거
  s = s.replace(/(^|\s)\^(\s|$)/gm, "$1$2");
  s = s.replace(/\s\^(?=\s)/g, " ");

  // ── 9. 중복 공백 제거 ─────────────────────────────────────
  s = s.replace(/[ \t]{2,}/g, " ").trim();

  return s;
}

/**
 * PDF 추출 텍스트에서 유실된 공백을 휴리스틱으로 복원합니다.
 * - 수식 줄(isMathLine)은 건드리지 않음
 * - 한국어/CJK 텍스트는 skip
 * - 수식 세그먼트가 아닌 text 세그먼트에만 호출됨
 */
function restoreWordSpacing(text: string): string {
  if (!text || text.length < 2) return text;

  // 한국어/CJK 포함 시 skip
  if (/[\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u30FF]/.test(text)) return text;

  // 라틴 문자 비율 25% 미만이면 skip
  const latinCount = (text.match(/[a-zA-Z]/g) ?? []).length;
  if (latinCount < 3 || latinCount / text.length < 0.25) return text;

  // 줄 단위로 분리 → 수식 줄은 그대로, 텍스트 줄만 보정
  return text
    .split("\n")
    .map((line) => (isMathLine(line) ? line : fixLineText(line)))
    .join("\n");
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
      !/[\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u30FF]/.test(seg.value) &&
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
      // 읽기 가독성을 위해 inline/display 구분자와 관계없이 수식은 별도 행(block)으로 렌더링
      // 결과: "텍스트 + 수식 + 텍스트"가 시각적으로 명확하게 분리됨
      return <BlockMath key={`m-${idx}`} latex={seg.value} />;
    }
    // 수식이 아닌 텍스트에만 공백 복원 적용
    const displayText = restoreWordSpacing(seg.value);
    return (
      <span key={`t-${idx}`}>
        {searchQuery?.trim()
          ? renderSearchHighlights(
              displayText,
              searchQuery,
              markClass,
              markActiveClass,
              isSearchActive
            )
          : displayText}
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
