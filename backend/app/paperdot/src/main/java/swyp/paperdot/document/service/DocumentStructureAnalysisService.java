package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swyp.paperdot.doc_units.docUnits.docUnitsEntity;
import swyp.paperdot.doc_units.docUnits.docUnitsRepository;
import swyp.paperdot.document.dto.DocumentComplexityScore;
import swyp.paperdot.document.dto.DocumentStructureAnalysisResponse;
import swyp.paperdot.document.dto.PageStructureStats;
import swyp.paperdot.document.util.ComplexityScoreCalculator;
import swyp.paperdot.document.util.MathExpressionCounter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentStructureAnalysisService {

    private final docUnitsRepository docUnitsRepository;
    private final PdfTextExtractService pdfTextExtractService;

    @Value("${paperdot.complexity.weight-math:4.0}")
    private double complexityWeightMath;

    @Value("${paperdot.complexity.weight-image:2.0}")
    private double complexityWeightImage;

    @Value("${paperdot.complexity.weight-length:0.015}")
    private double complexityWeightLength;

    @Transactional(readOnly = true)
    public DocumentStructureAnalysisResponse analyze(Long documentId) {
        PdfTextExtractService.PdfPageLayout layout = pdfTextExtractService.extractPageLayout(documentId);
        int pageCount = layout.getPageCount();
        List<docUnitsEntity> units = docUnitsRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);

        Map<Integer, Integer> sentencesByPage = new HashMap<>();
        Map<Integer, Integer> mathByPage = new HashMap<>();
        long mathTotal = 0L;
        long totalSourceChars = 0L;

        for (docUnitsEntity u : units) {
            int p = u.getSourcePage() != null ? u.getSourcePage() : 1;
            if (pageCount > 0) {
                p = Math.max(1, Math.min(p, pageCount));
            }
            sentencesByPage.merge(p, 1, Integer::sum);
            String src = u.getSourceText();
            if (src != null) {
                totalSourceChars += src.length();
            }
            int m = MathExpressionCounter.countMathSpans(src != null ? src : "");
            mathByPage.merge(p, m, Integer::sum);
            mathTotal += m;
        }

        int paragraphTotal = 0;
        int imageTotal = 0;
        List<PageStructureStats> pages = new ArrayList<>(pageCount);
        for (int i = 0; i < pageCount; i++) {
            int pageNum = i + 1;
            int para = layout.getParagraphCountPerPage().get(i);
            int img = layout.getImageCountPerPage().get(i);
            paragraphTotal += para;
            imageTotal += img;
            pages.add(PageStructureStats.builder()
                    .pageNumber(pageNum)
                    .sentenceCount(sentencesByPage.getOrDefault(pageNum, 0))
                    .paragraphCount(para)
                    .mathCount(mathByPage.getOrDefault(pageNum, 0))
                    .imageCount(img)
                    .build());
        }

        DocumentComplexityScore complexity = ComplexityScoreCalculator.compute(
                mathTotal,
                imageTotal,
                paragraphTotal,
                units.size(),
                totalSourceChars,
                complexityWeightMath,
                complexityWeightImage,
                complexityWeightLength
        );

        return DocumentStructureAnalysisResponse.builder()
                .pageCount(pageCount)
                .sentenceCount(units.size())
                .paragraphCount(paragraphTotal)
                .mathCount(mathTotal)
                .imageCount(imageTotal)
                .pages(pages)
                .complexity(complexity)
                .build();
    }
}
