package swyp.paperdot.document.note;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDocNoteRepository extends JpaRepository<UserDocNoteEntity, Long> {

    List<UserDocNoteEntity> findByUserIdAndDocumentIdOrderByDocUnitIdAsc(Long userId, Long documentId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
