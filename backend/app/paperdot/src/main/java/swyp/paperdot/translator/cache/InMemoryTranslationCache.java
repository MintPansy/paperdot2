package swyp.paperdot.translator.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 프로세스 로컬 캐시. 단일 인스턴스 배포·개발에 적합. Redis 도입 시 {@link TranslationCachePort} 구현만 추가.
 */
@Slf4j
@Component
public class InMemoryTranslationCache implements TranslationCachePort {

    private final ConcurrentHashMap<String, String> store = new ConcurrentHashMap<>();
    private final int maxEntries;

    public InMemoryTranslationCache(
            @Value("${translation.cache.max-entries:100000}") int maxEntries
    ) {
        this.maxEntries = Math.max(1000, maxEntries);
    }

    @Override
    public Optional<String> get(String key) {
        String v = store.get(key);
        return Optional.ofNullable(v);
    }

    @Override
    public void put(String key, String value) {
        if (key == null || value == null) {
            return;
        }
        if (store.size() >= maxEntries && !store.containsKey(key)) {
            log.warn("translation cache at capacity ({}), clearing all entries", maxEntries);
            store.clear();
        }
        store.put(key, value);
    }
}
