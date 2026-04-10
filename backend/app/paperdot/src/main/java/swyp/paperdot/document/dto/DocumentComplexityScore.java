package swyp.paperdot.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 문서 복잡도 점수 v1.
 * <p>
 * {@code score = weightMath * mathCount + weightImage * imageCount + weightLength * averageParagraphLength}
 * <p>
 * {@code averageParagraphLength}는 doc_unit 원문 문자 합을 문단 수로 나눈 값이며,
 * 문단 수가 0이면 문장(doc_unit) 수로 나눈 평균 문장 길이로 대체합니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentComplexityScore {
    /** 반올림된 최종 점수 (소수 둘째 자리) */
    private double score;
    /** 평균 문단 길이(문자). 문단이 없으면 평균 문장 길이 */
    private double averageParagraphLength;
    private double mathContribution;
    private double imageContribution;
    private double lengthContribution;
}
