package swyp.paperdot.doc_units.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * DocUnitTranslation 엔티티에 대한 데이터베이스 작업을 처리하는 리포지토리입니다.
 */
@Repository
public interface DocUnitTranslationRepository extends JpaRepository<DocUnitTranslation, Long> {
    /**
     * 특정 documentId를 가진 DocUnit에 연결된 모든 DocUnitTranslation 엔티티를 삭제합니다.
     * DocUnit 엔티티와 Translation 엔티티 간의 관계를 고려하여 정의됩니다.
     * (DocUnitTranslation의 docUnit 필드가 DocUnitEntity를 참조하고, DocUnitEntity는 documentId 필드를 가짐)
     * @param documentId 삭제할 DocUnitTranslation의 DocUnitEntity의 documentId
     */
    void deleteByDocUnitDocumentId(Long documentId);

    /**
     * 특정 documentId를 가진 DocUnit에 연결된 모든 DocUnitTranslation 엔티티를 조회합니다.
     * DocUnitTranslation의 docUnit 필드가 DocUnitEntity를 참조하고, DocUnitEntity는 documentId 필드를 가짐
     * @param documentId 조회할 DocUnitTranslation의 DocUnitEntity의 documentId
     * @return 해당 documentId에 연결된 DocUnitTranslation 엔티티 리스트
     */
    List<DocUnitTranslation> findByDocUnitDocumentId(Long documentId);
}
