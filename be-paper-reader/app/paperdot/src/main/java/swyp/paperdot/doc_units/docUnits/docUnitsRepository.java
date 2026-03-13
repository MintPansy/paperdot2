package swyp.paperdot.doc_units.docUnits;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface docUnitsRepository extends JpaRepository<docUnitsEntity, Long> {

    /**
     * 특정 documentId에 해당하는 DocUnit이 하나라도 존재하는지 확인합니다.
     *
     * @param documentId 문서 ID
     * @return 존재하면 true, 아니면 false
     */
    boolean existsByDocumentId(Long documentId);

    /**
     * 특정 documentId에 해당하는 모든 DocUnit을 삭제합니다.
     * @Modifying 어노테이션은 이 쿼리가 SELECT가 아닌 INSERT, UPDATE, DELETE 임을 나타냅니다.
     * JPQL을 사용한 벌크 삭제는 JPA가 각 엔티티를 하나씩 삭제하는 것보다 훨씬 효율적입니다.
     *
     * @param documentId 문서 ID
     */
    @Modifying
    @Query("DELETE FROM docUnitsEntity d WHERE d.documentId = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);

    /**
     * 특정 documentId에 해당하는 모든 DocUnit을 orderInDoc 순서에 따라 오름차순으로 조회합니다.
     *
     * @param documentId 문서 ID
     * @return 조회된 DocUnit 리스트
     */
    List<docUnitsEntity> findByDocumentIdOrderByOrderInDocAsc(Long documentId);

    /**
     * 특정 documentId와 status에 해당하는 모든 DocUnit을 orderInDoc 순서에 따라 오름차순으로 조회합니다.
     *
     * @param documentId 문서 ID
     * @param status 조회할 DocUnit의 상태
     * @return 조회된 DocUnit 리스트
     */
    List<docUnitsEntity> findByDocumentIdAndStatusOrderByOrderInDocAsc(Long documentId, swyp.paperdot.doc_units.enums.UnitStatus status);

    long countByDocumentId(Long documentId);

    long countByDocumentIdAndStatus(Long documentId, swyp.paperdot.doc_units.enums.UnitStatus status);
}
