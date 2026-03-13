package swyp.paperdot.document.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swyp.paperdot.document.domain.Document;
import swyp.paperdot.document.dto.DocumentTranslationHistoryItemResponse;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("""
            SELECT new swyp.paperdot.document.dto.DocumentTranslationHistoryItemResponse(
                    d.id,
                    d.title,
                    d.languageSrc,
                    d.languageTgt,
                    d.totalPages,
                    MAX(t.createdAt)
            )
            FROM Document d, DocUnitTranslation t
            WHERE d.ownerId = :ownerId
              AND t.docUnit.documentId = d.id
            GROUP BY d.id, d.title, d.languageSrc, d.languageTgt, d.totalPages
            ORDER BY MAX(t.createdAt) DESC
            """)
    List<DocumentTranslationHistoryItemResponse> findTranslationHistoryByOwnerId(@Param("ownerId") Long ownerId);
}
