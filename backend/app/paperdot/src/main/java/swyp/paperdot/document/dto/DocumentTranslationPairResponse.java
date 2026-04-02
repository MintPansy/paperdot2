package swyp.paperdot.document.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTranslationPairResponse {
    private Long docUnitId;
    private String sourceText;
    private String translatedText;
    /** 원본 PDF 페이지(1-based). 파이프라인이 페이지 단위 추출 시 설정 */
    private Integer sourcePage;
}
