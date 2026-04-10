package swyp.paperdot.document.util;

import java.util.regex.Pattern;

/**
 * {@code frontend/app/components/read/mathSegments.ts} 의 splitMathSegments 와 동일한 규칙으로
 * 수식 구간 개수를 셉니다 (KaTeX 렌더 경로와 정합).
 */
public final class MathExpressionCounter {

    private static final Pattern CJK = Pattern.compile("[\\uAC00-\\uD7A3\\u4E00-\\u9FFF\\u3040-\\u30FF]");

    private MathExpressionCounter() {
    }

    public static int countMathSpans(String input) {
        if (input == null || input.isEmpty()) {
            return 0;
        }
        int count = 0;
        int pos = 0;
        while (pos < input.length()) {
            MathStart next = findNextMathStart(input, pos);
            if (next == null) {
                break;
            }
            if (next.index > pos) {
                // text before math — skip
            }
            int end;
            String inner;
            if ("dd".equals(next.mode)) {
                int close = input.indexOf("$$", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else if ("br".equals(next.mode)) {
                int close = input.indexOf("\\]", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else if ("pr".equals(next.mode)) {
                int close = input.indexOf("\\)", next.index + 2);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 2, close);
                end = close + 2;
            } else {
                int close = findClosingSingleDollar(input, next.index + 1);
                if (close < 0) {
                    pos = next.index + 1;
                    continue;
                }
                inner = input.substring(next.index + 1, close);
                end = close + 1;
            }

            String trimmed = inner.trim();
            if (trimmed.isEmpty()) {
                pos = end;
                continue;
            }
            if (CJK.matcher(trimmed).find()) {
                pos = end;
                continue;
            }
            count++;
            pos = end;
        }
        return count;
    }

    private record MathStart(int index, String mode) {
    }

    private static int findClosingSingleDollar(String s, int from) {
        int i = from;
        while (i < s.length()) {
            int j = s.indexOf('$', i);
            if (j < 0) {
                return -1;
            }
            if (j + 1 < s.length() && s.charAt(j + 1) == '$') {
                i = j + 2;
                continue;
            }
            return j;
        }
        return -1;
    }

    private static MathStart findNextMathStart(String s, int pos) {
        MathStart best = null;

        int iDd = s.indexOf("$$", pos);
        if (iDd >= 0) {
            best = new MathStart(iDd, "dd");
        }

        int iBr = s.indexOf("\\[", pos);
        if (iBr >= 0 && (best == null || iBr < best.index)) {
            best = new MathStart(iBr, "br");
        }

        int iPr = s.indexOf("\\(", pos);
        if (iPr >= 0 && (best == null || iPr < best.index)) {
            best = new MathStart(iPr, "pr");
        }

        int i = pos;
        while (i < s.length()) {
            if (s.charAt(i) != '$') {
                i++;
                continue;
            }
            if (i + 1 < s.length() && s.charAt(i + 1) == '$') {
                i += 2;
                continue;
            }
            if (best == null || i < best.index) {
                best = new MathStart(i, "sd");
            }
            break;
        }

        return best;
    }
}
