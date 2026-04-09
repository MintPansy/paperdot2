export type LatexNode =
  | { type: "section"; title: string }
  | { type: "equation"; latex: string; number: number }
  | { type: "inline"; latex: string }
  | { type: "text"; text: string };

type ParseState = {
  nodes: LatexNode[];
  eqNo: number;
};

function isIgnorableLine(line: string): boolean {
  const t = line.trim();
  return t === "" || t.startsWith("%");
}

function normalizeInlineLatex(line: string): string {
  return line
    .trim()
    .replaceAll("\\lvert", "\\left|")
    .replaceAll("\\rvert", "\\right|")
    .replaceAll("\\mid", "\\;\\middle|\\;");
}

function isLikelyInlineLatex(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("\\") || t.includes("^") || t.includes("_")) return true;
  if (t.includes("=") && !/[.!?]$/.test(t)) return true;
  return false;
}

function readEquationBlock(lines: string[], start: number): { latex: string; end: number } {
  const buffer: string[] = [];
  let i = start;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t.startsWith("\\end{equation}")) break;
    if (!isIgnorableLine(t)) buffer.push(t);
    i += 1;
  }
  return { latex: buffer.join("\n"), end: i };
}

export function parseLatexDocument(source: string): LatexNode[] {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const state: ParseState = { nodes: [], eqNo: 0 };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();
    if (isIgnorableLine(t)) {
      i += 1;
      continue;
    }

    const sectionMatch = t.match(/^\\section\{(.+)\}$/);
    if (sectionMatch) {
      state.nodes.push({ type: "section", title: sectionMatch[1] });
      i += 1;
      continue;
    }

    if (t.startsWith("\\begin{equation}")) {
      const { latex, end } = readEquationBlock(lines, i + 1);
      state.eqNo += 1;
      state.nodes.push({
        type: "equation",
        latex: normalizeInlineLatex(latex),
        number: state.eqNo,
      });
      i = end + 1;
      continue;
    }

    if (isLikelyInlineLatex(t)) {
      state.nodes.push({ type: "inline", latex: normalizeInlineLatex(t) });
    } else {
      state.nodes.push({ type: "text", text: t });
    }
    i += 1;
  }

  return state.nodes;
}
