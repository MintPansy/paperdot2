package swyp.paperdot.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swyp.paperdot.document.domain.DocumentFile;
import swyp.paperdot.document.enums.DocumentFileType;

import java.util.Optional;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {

    /**
     * 문서 ID와 파일 타입을 기준으로 DocumentFile을 조회합니다.
     * ORIGINAL_PDF 파일을 찾거나, 특정 타입의 생성된 파일을 찾는 데 사용될 수 있습니다.
     *
     * @param documentId 부모 Document의 ID
     * @param fileType 조회할 파일의 타입 (e.g., DocumentFileType.ORIGINAL_PDF)
     * @return 조회된 DocumentFile. 결과가 없을 수 있으므로 Optional로 감싸서 반환합니다.
     */
    Optional<DocumentFile> findByDocumentIdAndFileType(Long documentId, DocumentFileType fileType);
}
