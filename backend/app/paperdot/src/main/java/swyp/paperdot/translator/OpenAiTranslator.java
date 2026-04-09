package swyp.paperdot.translator;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import swyp.paperdot.translator.cache.TranslationCacheKeys;
import swyp.paperdot.translator.cache.TranslationCachePort;
import swyp.paperdot.translator.dto.OpenAiTranslationDto;
import swyp.paperdot.translator.dto.OpenAiTranslationDto.AcademicTranslationItem;
import swyp.paperdot.translator.dto.OpenAiTranslationDto.TranslationPair;
import swyp.paperdot.translator.exception.TranslationException;
import swyp.paperdot.translator.exception.TranslationSizeMismatchException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
public class OpenAiTranslator implements TranslatorPort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TranslationCachePort translationCache;

    private static final int ACADEMIC_MAX_ATTEMPTS = 3;

    /**
     * {@link #createTranslationOnlyPrompt(String)} 변경 시 올려서 캐시 무효화에 대응.
     */
    private static final String TRANSLATION_ONLY_PROMPT_VERSION = "1";

    private final String apiKey;
    private final String model;
    private final String apiUrl = "https://api.openai.com/v1/chat/completions";
    private final boolean translationCacheEnabled;

    public OpenAiTranslator(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            TranslationCachePort translationCache,
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.model}") String model,
            @Value("${translation.cache.enabled:true}") boolean translationCacheEnabled
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.translationCache = translationCache;
        this.apiKey = apiKey;
        this.model = model;
        this.translationCacheEnabled = translationCacheEnabled;
    }

    public List<TranslationPair> extractAndTranslate(String rawText, String targetLang) {
        if (rawText == null || rawText.isBlank()) {
            return Collections.emptyList();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        OpenAiTranslationDto.Message systemMessage = new OpenAiTranslationDto.Message("system", createSystemPrompt(targetLang));
        OpenAiTranslationDto.Message userMessage = new OpenAiTranslationDto.Message("user", rawText);

        OpenAiTranslationDto.ChatRequest request = OpenAiTranslationDto.ChatRequest.of(model, List.of(systemMessage, userMessage));

        if (log.isDebugEnabled()) {
            log.debug("OpenAI API Key (masked): {}", apiKey != null && apiKey.length() > 5 ? apiKey.substring(0, 5) + "..." : apiKey);
            log.debug("OpenAI API Request Headers: {}", headers);
            try {
                log.debug("OpenAI API Request Body: {}", objectMapper.writeValueAsString(request));
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize OpenAI request for logging", e);
            }
        }
        try {
            HttpEntity<OpenAiTranslationDto.ChatRequest> entity = new HttpEntity<>(request, headers);
            OpenAiTranslationDto.ChatResponse response = restTemplate.postForObject(apiUrl, entity, OpenAiTranslationDto.ChatResponse.class);

            if (log.isDebugEnabled()) {
                try {
                    log.debug("OpenAI API Raw Response: {}", objectMapper.writeValueAsString(response));
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize OpenAI response for logging", e);
                }
            }

            if (response == null || CollectionUtils.isEmpty(response.getChoices())) {
                throw new TranslationException("OpenAI returned an empty response.", null);
            }

            String rawContent = response.getChoices().get(0).getMessage().content();
            return parseOpenAiResponseForPairs(rawContent);

        } catch (RestClientException e) {
            throw new TranslationException("OpenAI API call failed. " + e.getMessage(), e);
        }
    }

    public List<String> translateSentences(List<String> sentences, String targetLang) {
        if (sentences == null || sentences.isEmpty()) {
            return Collections.emptyList();
        }

        if (!translationCacheEnabled) {
            return fetchSentenceTranslationsFromApi(sentences, targetLang);
        }

        List<String> out = new ArrayList<>(Collections.nCopies(sentences.size(), ""));
        List<Integer> missIndices = new ArrayList<>();
        List<String> missSentences = new ArrayList<>();
        int hits = 0;

        for (int i = 0; i < sentences.size(); i++) {
            String src = sentences.get(i);
            String key = TranslationCacheKeys.sentenceTranslationKey(
                    TranslationCacheKeys.TASK_TRANSLATE_SENTENCES,
                    TRANSLATION_ONLY_PROMPT_VERSION,
                    model,
                    targetLang,
                    src
            );
            Optional<String> cached = translationCache.get(key);
            if (cached.isPresent()) {
                out.set(i, cached.get());
                hits++;
                log.info("translation cache HIT keyPrefix={} index={}/{}", key.substring(0, Math.min(12, key.length())), i + 1, sentences.size());
            } else {
                missIndices.add(i);
                missSentences.add(src);
            }
        }

        if (missSentences.isEmpty()) {
            log.info("translation cache FULL_HIT sentences={} (no OpenAI call)", sentences.size());
            return out;
        }

        log.info("translation cache MISS apiCalls=1 missSentences={} hits={} (of {})",
                missSentences.size(), hits, sentences.size());

        List<String> apiPart = fetchSentenceTranslationsFromApi(missSentences, targetLang);
        if (apiPart.size() != missSentences.size()) {
            throw new TranslationException(
                    "translation size mismatch after API: expected=" + missSentences.size() + ", actual=" + apiPart.size(),
                    null
            );
        }

        for (int j = 0; j < missIndices.size(); j++) {
            int idx = missIndices.get(j);
            String translated = apiPart.get(j);
            out.set(idx, translated);
            String key = TranslationCacheKeys.sentenceTranslationKey(
                    TranslationCacheKeys.TASK_TRANSLATE_SENTENCES,
                    TRANSLATION_ONLY_PROMPT_VERSION,
                    model,
                    targetLang,
                    sentences.get(idx)
            );
            translationCache.put(key, translated);
        }

        return out;
    }

    private List<String> fetchSentenceTranslationsFromApi(List<String> sentences, String targetLang) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String userContent;
        try {
            userContent = objectMapper.writeValueAsString(sentences);
        } catch (JsonProcessingException e) {
            throw new TranslationException("Failed to serialize sentences to JSON.", e);
        }

        OpenAiTranslationDto.Message systemMessage = new OpenAiTranslationDto.Message("system", createTranslationOnlyPrompt(targetLang));
        OpenAiTranslationDto.Message userMessage = new OpenAiTranslationDto.Message("user", userContent);

        OpenAiTranslationDto.ChatRequest request = OpenAiTranslationDto.ChatRequest.of(model, List.of(systemMessage, userMessage));

        try {
            HttpEntity<OpenAiTranslationDto.ChatRequest> entity = new HttpEntity<>(request, headers);
            OpenAiTranslationDto.ChatResponse response = restTemplate.postForObject(apiUrl, entity, OpenAiTranslationDto.ChatResponse.class);

            if (response == null || CollectionUtils.isEmpty(response.getChoices())) {
                throw new TranslationException("OpenAI returned an empty response.", null);
            }

            String rawContent = response.getChoices().get(0).getMessage().content();
            return parseOpenAiResponseForStringList(rawContent);

        } catch (RestClientException e) {
            throw new TranslationException("OpenAI API call failed. " + e.getMessage(), e);
        }
    }

    public List<AcademicTranslationItem> translateAcademic(String inputText) {
        if (inputText == null || inputText.isBlank()) {
            return Collections.emptyList();
        }

        int expectedCount = countSentences(inputText);
        Exception lastException = null;

        for (int attempt = 1; attempt <= ACADEMIC_MAX_ATTEMPTS; attempt++) {
            try {
                List<AcademicTranslationItem> items = callOpenAiForAcademic(inputText);

                if (items.size() != expectedCount) {
                    log.warn("Academic translation size mismatch on attempt {}/{}: expected={}, actual={}",
                            attempt, ACADEMIC_MAX_ATTEMPTS, expectedCount, items.size());
                    lastException = new TranslationSizeMismatchException(
                            String.format("Expected %d sentences but got %d. attempt=%d", expectedCount, items.size(), attempt));
                    continue;
                }

                return items;

            } catch (TranslationSizeMismatchException e) {
                lastException = e;
            } catch (TranslationException e) {
                log.error("Academic translation API error on attempt {}/{}: {}", attempt, ACADEMIC_MAX_ATTEMPTS, e.getMessage());
                lastException = e;
            }
        }

        if (lastException instanceof TranslationSizeMismatchException) {
            throw (TranslationSizeMismatchException) lastException;
        }
        throw new TranslationException("Academic translation failed after " + ACADEMIC_MAX_ATTEMPTS + " attempts.", lastException);
    }

    private List<AcademicTranslationItem> callOpenAiForAcademic(String inputText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        OpenAiTranslationDto.Message systemMessage = new OpenAiTranslationDto.Message("system", createAcademicTranslationPrompt());
        OpenAiTranslationDto.Message userMessage = new OpenAiTranslationDto.Message("user", inputText);

        OpenAiTranslationDto.ChatRequest request = OpenAiTranslationDto.ChatRequest.of(
                model,
                List.of(systemMessage, userMessage),
                new OpenAiTranslationDto.ResponseFormat("json_object")
        );

        try {
            HttpEntity<OpenAiTranslationDto.ChatRequest> entity = new HttpEntity<>(request, headers);
            OpenAiTranslationDto.ChatResponse response = restTemplate.postForObject(apiUrl, entity, OpenAiTranslationDto.ChatResponse.class);

            if (response == null || CollectionUtils.isEmpty(response.getChoices())) {
                throw new TranslationException("OpenAI returned an empty response.", null);
            }

            String rawContent = response.getChoices().get(0).getMessage().content();
            return parseAcademicTranslationResponse(rawContent);

        } catch (RestClientException e) {
            throw new TranslationException("OpenAI API call failed. " + e.getMessage(), e);
        }
    }

    private int countSentences(String text) {
        String[] parts = text.trim().split("(?<=[.?!])\\s+");
        return parts.length;
    }

    private List<AcademicTranslationItem> parseAcademicTranslationResponse(String content) {
        try {
            // response_format: json_object 모드에서는 {"translations": [...]} 래퍼로 올 수 있음
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(content);
            com.fasterxml.jackson.databind.JsonNode arrayNode = root.isArray() ? root : root.get("translations");

            if (arrayNode == null || !arrayNode.isArray()) {
                throw new TranslationException("Unexpected academic translation response format. content=" + content, null);
            }

            TypeReference<List<AcademicTranslationItem>> typeRef = new TypeReference<>() {};
            return objectMapper.convertValue(arrayNode, typeRef);

        } catch (JsonProcessingException e) {
            throw new TranslationException("Failed to parse academic translation response. content=" + content, e);
        }
    }

    private String createAcademicTranslationPrompt() {
        return "You are a professional academic translator.\n" +
               "Translate the following English academic text into Korean.\n\n" +
               "IMPORTANT RULES:\n" +
               "1. Preserve sentence boundaries exactly as in the original text.\n" +
               "2. Do NOT merge or split sentences.\n" +
               "3. Maintain one-to-one correspondence between original and translated sentences.\n" +
               "4. Output a JSON object with a \"translations\" key containing an array.\n\n" +
               "Format:\n" +
               "{\"translations\": [{\"id\": 1, \"original\": \"...\", \"translated\": \"...\"}, ...]}";
    }

    private String createSystemPrompt(String targetLang) {
        return String.format(
            "You are a translator that takes raw text, splits it into logical sentences, and translates each sentence into %s. " +
            "The response MUST be a JSON array of objects. Each object MUST contain two keys: 'source' for an original logical sentence and 'translated' for its corresponding translated sentence. " +
            "The number of objects in the array MUST be exactly the same as the number of logical sentences you identify in the input text. " +
            "Do NOT include any additional text, explanations, or markdown formatting outside the JSON array. " +
            "Ensure that the string values for 'source' and 'translated' are valid JSON strings, properly escaping any internal double quotes or special characters. " +
            "Example: [{\"source\": \"Hello World.\", \"translated\": \"안녕하세요.\"}, {\"source\": \"How are you?\", \"translated\": \"어떠세요?\"}]",
            targetLang
        );
    }

    private String createTranslationOnlyPrompt(String targetLang) {
        return String.format(
            "You are a translator. Translate each element of the input JSON array into %s. " +
            "The response MUST be a JSON array of strings with the same length and order as the input. " +
            "Do NOT include any additional text, explanations, or markdown formatting outside the JSON array.",
            targetLang
        );
    }

    private List<TranslationPair> parseOpenAiResponseForPairs(String content) {
        try {
            TypeReference<List<TranslationPair>> typeRef = new TypeReference<>() {};
            List<TranslationPair> translationPairs = objectMapper.readValue(content, typeRef);

            if (translationPairs == null) {
                throw new TranslationException("Translation pairs missing. content=" + content, null);
            }
            return translationPairs;

        } catch (JsonProcessingException e) {
            throw new TranslationException("Failed to parse translation response as JSON. content=" + content, e);
        }
    }

    private List<String> parseOpenAiResponseForStringList(String content) {
        try {
            TypeReference<List<String>> typeRef = new TypeReference<>() {};
            List<String> translated = objectMapper.readValue(content, typeRef);

            if (translated == null) {
                throw new TranslationException("Translated list missing. content=" + content, null);
            }
            return translated;

        } catch (JsonProcessingException e) {
            throw new TranslationException("Failed to parse translation response as JSON array of strings. content=" + content, e);
        }
    }
}