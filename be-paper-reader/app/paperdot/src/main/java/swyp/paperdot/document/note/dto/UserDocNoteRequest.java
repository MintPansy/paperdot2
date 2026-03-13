package swyp.paperdot.document.note.dto;

import lombok.*;
import swyp.paperdot.document.note.NoteType;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocNoteRequest {

    private Long docUnitId;
    private NoteType noteType;
    private String content;
    private String color;
}
