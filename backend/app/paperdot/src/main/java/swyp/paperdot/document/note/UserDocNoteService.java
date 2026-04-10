package swyp.paperdot.document.note;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swyp.paperdot.common.JwtAuthFilter;
import swyp.paperdot.document.note.dto.UserDocNoteRequest;
import swyp.paperdot.document.note.dto.UserDocNoteResponse;
import swyp.paperdot.document.repository.DocumentRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDocNoteService {

  private final UserDocNoteRepository userDocNoteRepository;
  private final DocumentRepository documentRepository;

  private void ensureDocumentOwner(Long documentId, Long userId) {
    documentRepository.findById(documentId)
        .filter(d -> d.getOwnerId().equals(userId))
        .orElseThrow(() -> new IllegalArgumentException("Document not found or access denied"));
  }

  @Transactional(readOnly = true)
  public List<UserDocNoteResponse> getNotes(Long documentId, Long userId) {
    ensureDocumentOwner(documentId, userId);
    return userDocNoteRepository.findByUserIdAndDocumentIdOrderByDocUnitIdAsc(userId, documentId)
        .stream()
        .map(UserDocNoteResponse::from)
        .collect(Collectors.toList());
  }

  @Transactional
  public UserDocNoteResponse create(Long documentId, Long userId, UserDocNoteRequest request) {
    ensureDocumentOwner(documentId, userId);
    UserDocNoteEntity entity = UserDocNoteEntity.builder()
        .userId(userId)
        .documentId(documentId)
        .docUnitId(request.getDocUnitId())
        .noteType(request.getNoteType())
        .content(request.getContent())
        .color(request.getColor())
        .build();
    entity = userDocNoteRepository.save(entity);
    return UserDocNoteResponse.from(entity);
  }

  @Transactional
  public UserDocNoteResponse update(Long documentId, Long noteId, Long userId, UserDocNoteRequest request) {
    ensureDocumentOwner(documentId, userId);
    UserDocNoteEntity entity = userDocNoteRepository.findById(noteId)
        .orElseThrow(() -> new IllegalArgumentException("Note not found"));
    if (!entity.getUserId().equals(userId) || !entity.getDocumentId().equals(documentId)) {
      throw new IllegalArgumentException("Note not found or access denied");
    }
    if (request.getContent() != null)
      entity.updateContent(request.getContent());
    if (request.getColor() != null)
      entity.updateColor(request.getColor());
    return UserDocNoteResponse.from(userDocNoteRepository.save(entity));
  }

  @Transactional
  public void delete(Long documentId, Long noteId, Long userId) {
    ensureDocumentOwner(documentId, userId);
    UserDocNoteEntity entity = userDocNoteRepository.findById(noteId)
        .orElseThrow(() -> new IllegalArgumentException("Note not found"));
    if (!entity.getUserId().equals(userId) || !entity.getDocumentId().equals(documentId)) {
      throw new IllegalArgumentException("Note not found or access denied");
    }
    userDocNoteRepository.delete(entity);
  }
}
