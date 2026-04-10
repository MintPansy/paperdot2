package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader; // Loader 클래스 import
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import swyp.paperdot.document.exception.DocumentNotFoundException;
import swyp.paperdot.document.exception.PdfParseException;
import swyp.paperdot.document.exception.StorageDownloadException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
// Files, Path, StandardCopyOption은 더 이상 필요 없으므로 제거 (혹시 이전 코드에 있었다면)

/**
 * PDF 파일에서 텍스트를 추출하는 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PdfTextExtractService {

    private final DocumentDownloadService documentDownloadService;

    /**
     * 주어진 문서 ID에 해당하는 원본 PDF 파일에서 텍스트 전체를 추출하여 반환합니다.
     *
     * @param documentId 텍스트를 추출할 문서의 ID
     * @return 추출된 텍스트(String)
     * @throws DocumentNotFoundException  DB에 해당 문서 또는 원본 PDF 파일 정보가 없을 경우 (그대로 전파됨)
     * @throws StorageDownloadException   스토리지에서 PDF 파일을 다운로드하는 데 실패할 경우 (그대로 전파됨)
     * @throws PdfParseException          PDF 처리 중 오류가 발생할 경우
     */
    public String extractText(Long documentId) {
        log.info("documentId {} - PDF 텍스트 추출 시작", documentId);
        try (InputStream inputStream = documentDownloadService.downloadOriginalPdf(documentId)) {
            log.info("documentId {} - PDF 파일 스트림 다운로드 완료.", documentId);
            try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                log.info("documentId {} - PDF 텍스트 추출 완료. 추출된 텍스트 길이: {}", documentId, text.length());
                return text;
            }
        } catch (DocumentNotFoundException | StorageDownloadException e) {
            log.error("documentId {} - PDF 텍스트 추출 중 문서 또는 스토리지 오류 발생: {}", documentId, e.getMessage(), e);
            throw e; // 호출자에게 예외 전파
        } catch (IOException e) {
            log.error("documentId {} - PDF 텍스트 추출 중 I/O 또는 PDF 파싱 오류 발생: {}", documentId, e.getMessage(), e);
            throw new PdfParseException("Failed to process PDF file for documentId: " + documentId, e);
        }
    }

    /**
     * 페이지별로 텍스트를 추출합니다 (순서는 1페이지부터).
     */
    public List<String> extractTextByPages(Long documentId) {
        log.info("documentId {} - PDF 페이지별 텍스트 추출 시작", documentId);
        try (InputStream inputStream = documentDownloadService.downloadOriginalPdf(documentId)) {
            try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
                int total = document.getNumberOfPages();
                PDFTextStripper stripper = new PDFTextStripper();
                List<String> pages = new ArrayList<>(total);
                for (int i = 1; i <= total; i++) {
                    stripper.setStartPage(i);
                    stripper.setEndPage(i);
                    pages.add(stripper.getText(document));
                }
                log.info("documentId {} - 페이지별 추출 완료. pages={}", documentId, pages.size());
                return pages;
            }
        } catch (DocumentNotFoundException | StorageDownloadException e) {
            log.error("documentId {} - 페이지별 추출 중 문서/스토리지 오류: {}", documentId, e.getMessage(), e);
            throw e;
        } catch (IOException e) {
            log.error("documentId {} - 페이지별 추출 중 I/O 오류: {}", documentId, e.getMessage(), e);
            throw new PdfParseException("Failed to process PDF pages for documentId: " + documentId, e);
        }
    }

    /**
     * 페이지별 문단 수(빈 줄 2회 이상으로 구분된 블록), 래스터 이미지(PDImageXObject) 수를 한 번의 PDF 로드로 계산합니다.
     */
    public PdfPageLayout extractPageLayout(Long documentId) {
        log.info("documentId {} - PDF 페이지 레이아웃(문단/이미지) 분석", documentId);
        try (InputStream inputStream = documentDownloadService.downloadOriginalPdf(documentId)) {
            try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
                int total = document.getNumberOfPages();
                PDFTextStripper stripper = new PDFTextStripper();
                List<Integer> paragraphs = new ArrayList<>(total);
                List<Integer> images = new ArrayList<>(total);
                for (int i = 1; i <= total; i++) {
                    stripper.setStartPage(i);
                    stripper.setEndPage(i);
                    String pageText = stripper.getText(document);
                    paragraphs.add(countParagraphsInPageText(pageText));
                    PDPage page = document.getPage(i - 1);
                    images.add(countImagesOnPage(page));
                }
                return new PdfPageLayout(total, paragraphs, images);
            }
        } catch (DocumentNotFoundException | StorageDownloadException e) {
            log.error("documentId {} - 레이아웃 분석 문서/스토리지 오류: {}", documentId, e.getMessage(), e);
            throw e;
        } catch (IOException e) {
            log.error("documentId {} - 레이아웃 분석 I/O 오류: {}", documentId, e.getMessage(), e);
            throw new PdfParseException("Failed to analyze PDF layout for documentId: " + documentId, e);
        }
    }

    public static final class PdfPageLayout {
        private final int pageCount;
        private final List<Integer> paragraphCountPerPage;
        private final List<Integer> imageCountPerPage;

        public PdfPageLayout(int pageCount, List<Integer> paragraphCountPerPage, List<Integer> imageCountPerPage) {
            this.pageCount = pageCount;
            this.paragraphCountPerPage = paragraphCountPerPage;
            this.imageCountPerPage = imageCountPerPage;
        }

        public int getPageCount() {
            return pageCount;
        }

        public List<Integer> getParagraphCountPerPage() {
            return paragraphCountPerPage;
        }

        public List<Integer> getImageCountPerPage() {
            return imageCountPerPage;
        }
    }

    static int countParagraphsInPageText(String pageText) {
        if (pageText == null || pageText.isBlank()) {
            return 0;
        }
        String t = pageText.trim();
        String[] blocks = t.split("(?:\\r\\n|\\r|\\n){2,}");
        int c = 0;
        for (String b : blocks) {
            if (!b.trim().isEmpty()) {
                c++;
            }
        }
        return Math.max(c, 1);
    }

    private static int countImagesOnPage(PDPage page) {
        PDResources resources = page.getResources();
        if (resources == null) {
            return 0;
        }
        int n = 0;
        for (COSName name : resources.getXObjectNames()) {
            try {
                PDXObject xo = resources.getXObject(name);
                if (xo instanceof PDImageXObject) {
                    n++;
                }
            } catch (IOException ex) {
                log.debug("skip XObject {}: {}", name, ex.getMessage());
            }
        }
        return n;
    }
}
