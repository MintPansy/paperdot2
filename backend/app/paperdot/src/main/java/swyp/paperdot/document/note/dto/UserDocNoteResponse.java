package swyp.paperdot.document.note.dto;

import lombok.*;
import swyp.paperdot.document.note.NoteType;
import swyp.paperdot.document.note.UserDocNoteEntity;

import java.time.Instant;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocNoteResponse {

    private Long id;
    private Long docUnitId;
    private NoteType noteType;
    private String content;
    private String color;
    private Instant createdAt;

    public static UserDocNoteResponse from(UserDocNoteEntity entity) {
        return UserDocNoteResponse.builder()
                .id(entity.getId())
                .docUnitId(entity.getDocUnitId())
                .noteType(entity.getNoteType())
                .content(entity.getContent())
                .color(entity.getColor())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
