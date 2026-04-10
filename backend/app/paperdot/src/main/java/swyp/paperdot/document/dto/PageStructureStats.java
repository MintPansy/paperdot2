package swyp.paperdot.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 한 PDF 페이지에 대한 구조 분석 집계 (1-based pageNumber).
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageStructureStats {
    private int pageNumber;
    /** 해당 페이지에 매핑된 문장(doc_unit) 수 */
    private int sentenceCount;
    /**
     * 페이지 텍스트 기준 문단 수(빈 줄 2회 이상으로 구분된 블록; 빈 페이지는 0).
     */
    private int paragraphCount;
    /** 해당 페이지 문장들에 포함된 LaTeX 수식 구간 수(프론트 KaTeX 분리 규칙과 동일) */
    private int mathCount;
    /** 페이지에 포함된 래스터 이미지(XObject) 수 */
    private int imageCount;
}
