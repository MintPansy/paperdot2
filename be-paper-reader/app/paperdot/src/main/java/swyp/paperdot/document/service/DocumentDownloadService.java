package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.S3Exception;
import swyp.paperdot.document.domain.DocumentFile;
import swyp.paperdot.document.enums.DocumentFileType;
import swyp.paperdot.document.exception.DocumentNotFoundException;
import swyp.paperdot.document.exception.InvalidStoragePathException;
import swyp.paperdot.document.exception.StorageDownloadException;
import swyp.paperdot.document.repository.DocumentFileRepository;
import swyp.paperdot.document.storage.NcpStoragePathParser;
import swyp.paperdot.document.storage.ObjectStorageClient;

import java.io.InputStream;

/**
 * 문서 다운로드 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class DocumentDownloadService {

    private final DocumentFileRepository documentFileRepository;
    private final ObjectStorageClient objectStorageClient;
    private final NcpStoragePathParser storagePathParser;

    /**
     * 특정 문서의 원본 PDF 파일을 스토리지에서 다운로드하여 InputStream으로 반환합니다.
     *
     * @param documentId 다운로드할 문서의 ID
     * @return 원본 PDF 파일의 내용을 담은 InputStream.
     * @throws DocumentNotFoundException      해당 ID의 문서 또는 원본 파일이 존재하지 않을 경우 (404 Not Found).
     * @throws InvalidStoragePathException    DB에 저장된 파일 경로가 형식에 맞지 않을 경우 (500 Internal Server Error).
     * @throws StorageDownloadException       스토리지에서 파일을 다운로드하는 중 오류가 발생할 경우 (503 Service Unavailable).
     * @apiNote 이 메서드를 통해 얻은 InputStream은 사용 후 반드시 호출자가 직접 close() 해야 합니다.
     *          try-with-resources 구문을 사용하는 것을 강력히 권장합니다.
     */
    public InputStream downloadOriginalPdf(Long documentId) {
        // 1. DB에서 문서 파일 메타데이터 조회
        // 이전에 추가한 findByDocumentIdAndFileType 쿼리 메서드를 사용합니다.
        DocumentFile documentFile = documentFileRepository.findByDocumentIdAndFileType(documentId, DocumentFileType.ORIGINAL_PDF)
                .orElseThrow(() -> new DocumentNotFoundException("Original PDF file not found for documentId: " + documentId));

        // 2. storagePath에서 objectKey 파싱
        // 새로 추가한 NcpStoragePathParser를 사용하여 DB에 저장된 경로에서 실제 객체 키를 추출합니다.
        String storagePath = documentFile.getStoragePath();
        String objectKey = storagePathParser.getObjectKey(storagePath);

        // 3. 스토리지 클라이언트를 통해 파일 다운로드
        try {
            // 확장된 ObjectStorageClient 인터페이스의 download 메서드를 호출합니다.
            return objectStorageClient.download(objectKey);
        } catch (S3Exception e) {
            // AWS SDK(S3-compatible)에서 발생하는 예외를 구체적으로 처리합니다.
            // 상태 코드(403, 404 등)를 포함하여 어떤 오류가 발생했는지 명확한 메시지를 담아 래핑합니다.
            String errorMessage = String.format(
                "Failed to download file from storage. objectKey: %s, statusCode: %d, message: %s",
                objectKey, e.statusCode(), e.awsErrorDetails().errorMessage()
            );
            throw new StorageDownloadException(errorMessage, e);
        } catch (Exception e) {
            // S3Exception 외에 발생할 수 있는 모든 예외(e.g., 네트워크 타임아웃)를 처리합니다.
            String errorMessage = String.format("An unexpected error occurred during file download. objectKey: %s", objectKey);
            throw new StorageDownloadException(errorMessage, e);
        }
    }
}
