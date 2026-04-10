package swyp.paperdot.document.util;

import swyp.paperdot.document.dto.DocumentComplexityScore;

/**
 * 구조 분석 수치로부터 복잡도 점수 v1을 계산합니다.
 */
public final class ComplexityScoreCalculator {

    private ComplexityScoreCalculator() {
    }

    public static DocumentComplexityScore compute(
            long mathCount,
            int imageCount,
            int paragraphCount,
            long sentenceCount,
            long totalSourceChars,
            double weightMath,
            double weightImage,
            double weightLength
    ) {
        double avgParagraphLength;
        if (paragraphCount > 0) {
            avgParagraphLength = (double) totalSourceChars / paragraphCount;
        } else if (sentenceCount > 0) {
            avgParagraphLength = (double) totalSourceChars / sentenceCount;
        } else {
            avgParagraphLength = 0.0;
        }

        double mathContribution = weightMath * mathCount;
        double imageContribution = weightImage * imageCount;
        double lengthContribution = weightLength * avgParagraphLength;
        double raw = mathContribution + imageContribution + lengthContribution;

        return DocumentComplexityScore.builder()
                .score(round2(raw))
                .averageParagraphLength(round2(avgParagraphLength))
                .mathContribution(round2(mathContribution))
                .imageContribution(round2(imageContribution))
                .lengthContribution(round2(lengthContribution))
                .build();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
