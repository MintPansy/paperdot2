package swyp.paperdot.document.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class DocumentTranslationHistoryItemResponse {
    private Long documentId;
    private String title;
    private String languageSrc;
    private String languageTgt;
    private Integer totalPages;
    private Instant lastTranslatedAt;
}
