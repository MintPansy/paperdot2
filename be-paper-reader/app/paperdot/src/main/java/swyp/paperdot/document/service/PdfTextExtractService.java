package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader; // Loader 클래스 import
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import swyp.paperdot.document.exception.DocumentNotFoundException;
import swyp.paperdot.document.exception.PdfParseException;
import swyp.paperdot.document.exception.StorageDownloadException;

import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
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
}
