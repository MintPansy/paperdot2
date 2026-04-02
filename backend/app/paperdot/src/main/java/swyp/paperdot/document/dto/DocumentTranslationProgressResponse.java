package swyp.paperdot.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentTranslationProgressResponse {
    private long total;
    private long translated;
    private long translating;
    private long created;
    private long failed;
}
