"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Options = {
  displayMode: boolean;
};

export function useMathRenderer(latex: string, options: Options) {
  return useMemo(() => {
    const safeLatex = (latex ?? "").trim();
    if (!safeLatex) return "";
    try {
      return katex.renderToString(safeLatex, {
        displayMode: options.displayMode,
        throwOnError: false,
        strict: (code) =>
          code === "unicodeTextInMathMode" || code === "mathVsTextUnits"
            ? "ignore"
            : "warn",
      });
    } catch {
      return katex.renderToString(safeLatex, {
        displayMode: options.displayMode,
        throwOnError: false,
      });
    }
  }, [latex, options.displayMode]);
}
