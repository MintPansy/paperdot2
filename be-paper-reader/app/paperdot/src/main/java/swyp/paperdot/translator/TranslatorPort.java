package swyp.paperdot.translator;

import swyp.paperdot.translator.dto.OpenAiTranslationDto.TranslationPair; // TranslationPair import
import java.util.List;

public interface TranslatorPort {

    /**
     * 원본 텍스트를 OpenAI에 보내 논리적 문장 단위로 분리하고, 각 문장을 번역하여 원본-번역 쌍의 리스트를 반환합니다.
     * @param rawText 원본 전체 텍스트
     * @param targetLang 번역 목표 언어 코드 (e.g., "ko")
     * @return 원본-번역 쌍 (TranslationPair) 리스트
     */
    List<TranslationPair> extractAndTranslate(String rawText, String targetLang);
}
