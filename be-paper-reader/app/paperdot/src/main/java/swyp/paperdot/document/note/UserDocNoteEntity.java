package swyp.paperdot.document.note;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "user_doc_notes", indexes = {
    @Index(name = "idx_user_doc_notes_user_document", columnList = "user_id, document_id")
})
public class UserDocNoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "doc_unit_id", nullable = false)
    private Long docUnitId;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", nullable = false, length = 20)
    private NoteType noteType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 20)
    private String color;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Builder
    public UserDocNoteEntity(Long userId, Long documentId, Long docUnitId, NoteType noteType, String content, String color) {
        this.userId = userId;
        this.documentId = documentId;
        this.docUnitId = docUnitId;
        this.noteType = noteType;
        this.content = content;
        this.color = color;
    }

    public void updateContent(String content) {
        this.content = content;
    }

    public void updateColor(String color) {
        this.color = color;
    }
}
