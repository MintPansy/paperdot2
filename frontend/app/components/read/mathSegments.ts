/**
 * 본문 문자열에서 LaTeX 수식 구간을 분리합니다.
 * 지원: $$...$$, \[...\], \(...\), $...$ (단일 $는 $$와 겹치지 않을 때)
 */

export type MathSegment =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; displayMode: boolean };

function findClosingDoubleDollar(s: string, from: number): number {
  return s.indexOf("$$", from);
}

function findClosingBracket(s: string, from: number): number {
  return s.indexOf("\\]", from);
}

function findClosingParen(s: string, from: number): number {
  return s.indexOf("\\)", from);
}

function findClosingSingleDollar(s: string, from: number): number {
  let i = from;
  while (i < s.length) {
    const j = s.indexOf("$", i);
    if (j < 0) return -1;
    if (s[j + 1] === "$") {
      i = j + 2;
      continue;
    }
    return j;
  }
  return -1;
}

/**
 * pos 이후에서 가장 이른 수식 시작 위치와 종류를 찾습니다.
 */
function findNextMathStart(
  s: string,
  pos: number
): { index: number; mode: "dd" | "br" | "pr" | "sd" } | null {
  let best: { index: number; mode: "dd" | "br" | "pr" | "sd" } | null = null;

  const iDd = s.indexOf("$$", pos);
  if (iDd >= 0) {
    best = { index: iDd, mode: "dd" };
  }

  const iBr = s.indexOf("\\[", pos);
  if (iBr >= 0 && (!best || iBr < best.index)) {
    best = { index: iBr, mode: "br" };
  }

  const iPr = s.indexOf("\\(", pos);
  if (iPr >= 0 && (!best || iPr < best.index)) {
    best = { index: iPr, mode: "pr" };
  }

  let i = pos;
  while (i < s.length) {
    if (s[i] !== "$") {
      i++;
      continue;
    }
    if (s[i + 1] === "$") {
      i += 2;
      continue;
    }
    if (!best || i < best.index) {
      best = { index: i, mode: "sd" };
    }
    break;
  }

  return best;
}

export function splitMathSegments(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let pos = 0;

  while (pos < input.length) {
    const next = findNextMathStart(input, pos);
    if (next == null) {
      segments.push({ kind: "text", value: input.slice(pos) });
      break;
    }

    if (next.index > pos) {
      segments.push({ kind: "text", value: input.slice(pos, next.index) });
    }

    let inner: string;
    let displayMode: boolean;
    let end: number;

    if (next.mode === "dd") {
      const close = findClosingDoubleDollar(input, next.index + 2);
      if (close < 0) {
        segments.push({ kind: "text", value: input[next.index] });
        pos = next.index + 1;
        continue;
      }
      inner = input.slice(next.index + 2, close);
      displayMode = true;
      end = close + 2;
    } else if (next.mode === "br") {
      const close = findClosingBracket(input, next.index + 2);
      if (close < 0) {
        segments.push({ kind: "text", value: input[next.index] });
        pos = next.index + 1;
        continue;
      }
      inner = input.slice(next.index + 2, close);
      displayMode = true;
      end = close + 2;
    } else if (next.mode === "pr") {
      const close = findClosingParen(input, next.index + 2);
      if (close < 0) {
        segments.push({ kind: "text", value: input[next.index] });
        pos = next.index + 1;
        continue;
      }
      inner = input.slice(next.index + 2, close);
      displayMode = false;
      end = close + 2;
    } else {
      const close = findClosingSingleDollar(input, next.index + 1);
      if (close < 0) {
        segments.push({ kind: "text", value: input[next.index] });
        pos = next.index + 1;
        continue;
      }
      inner = input.slice(next.index + 1, close);
      displayMode = false;
      end = close + 1;
    }

    const trimmed = inner.trim();
    if (trimmed.length === 0) {
      segments.push({ kind: "text", value: input.slice(next.index, end) });
      pos = end;
      continue;
    }

    segments.push({
      kind: "math",
      value: inner,
      displayMode,
    });
    pos = end;
  }

  return segments;
}
