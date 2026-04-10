package swyp.paperdot.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 문서 구조 분석 v1: 전체 합계 + 페이지별 분포.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStructureAnalysisResponse {
    private int pageCount;
    private long sentenceCount;
    private int paragraphCount;
    private long mathCount;
    private int imageCount;
    private List<PageStructureStats> pages;
}
