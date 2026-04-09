package swyp.paperdot.translator.cache;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * 캐시 키: 작업 종류 + 모델 + 대상 언어 + 프롬프트 버전 + 원문(정규화).
 */
public final class TranslationCacheKeys {

    public static final String TASK_TRANSLATE_SENTENCES = "TRANSLATE_SENTENCES";

    private TranslationCacheKeys() {
    }

    /**
     * 문장 단위 번역 캐시 키 (원문이 동일하고 모델·언어·프롬프트가 같으면 동일 키).
     */
    public static String sentenceTranslationKey(
            String task,
            String promptVersion,
            String model,
            String targetLang,
            String sourceText
    ) {
        String normalized = sourceText == null ? "" : sourceText.trim();
        String raw = task + "|pv=" + promptVersion + "|m=" + nullSafe(model)
                + "|tgt=" + nullSafe(targetLang) + "|src=" + normalized;
        return sha256Hex(raw);
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s.trim();
    }

    private static String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
