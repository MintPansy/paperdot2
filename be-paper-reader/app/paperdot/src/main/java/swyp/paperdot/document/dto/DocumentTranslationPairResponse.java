package swyp.paperdot.document.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTranslationPairResponse {
    private Long docUnitId;
    private String sourceText;
    private String translatedText;
}
