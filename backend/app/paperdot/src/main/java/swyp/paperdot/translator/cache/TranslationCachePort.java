package swyp.paperdot.translator.cache;

import java.util.Optional;

/**
 * 번역 등 LLM 결과 캐시 추상화. 기본 구현은 인메모리이며, 추후 Redis 등으로 교체 가능.
 */
public interface TranslationCachePort {

    Optional<String> get(String key);

    void put(String key, String value);
}
