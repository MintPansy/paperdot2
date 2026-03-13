package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import swyp.paperdot.doc_units.docUnits.docUnitsEntity;
import swyp.paperdot.doc_units.docUnits.docUnitsRepository;
import swyp.paperdot.doc_units.enums.UnitStatus;
import swyp.paperdot.doc_units.enums.UnitType;
import swyp.paperdot.doc_units.translation.DocUnitTranslation;
import swyp.paperdot.doc_units.translation.DocUnitTranslationRepository;
import swyp.paperdot.translator.OpenAiTranslator;
import swyp.paperdot.translator.dto.OpenAiTranslationDto.TranslationPair;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentPipelineService {

    private final PdfTextExtractService pdfTextExtractService;
    private final docUnitsRepository docUnitsRepository;
    private final OpenAiTranslator openAiTranslator;
    private final DocUnitTranslationRepository docUnitTranslationRepository;

    private static final String DEFAULT_SOURCE_LANG = "en";
    private static final String DEFAULT_TARGET_LANG = "ko";

    @Value("${translation.batch-size:30}")
    private int batchSize;

    public void processDocument(Long documentId, boolean overwrite) {
        log.info("===== Document Pipeline START for documentId: {} (Overwrite: {}) =====", documentId, overwrite);

        try {
            // Step 1: Extract full text from PDF
            log.info("[Step 1/3] documentId {} - PDF text extraction start", documentId);
            String rawText = pdfTextExtractService.extractText(documentId);
            log.info("[Step 1/3] documentId {} - PDF text extraction done. length={}", documentId, rawText.length());

            // Step 2: Local sentence split
            List<String> sentences = splitToSentences(rawText);
            log.info("[Step 2/3] documentId {} - sentence split done. count={}", documentId, sentences.size());

            // Step 3: Pre-save doc_units and translate in batches
            log.info("[Step 3/3] documentId {} - pre-save doc_units and batch translation start. Overwrite={}", documentId, overwrite);
            processTranslationInBatches(documentId, sentences, DEFAULT_TARGET_LANG, overwrite, batchSize);
            log.info("[Step 3/3] documentId {} - pre-save doc_units and batch translation done", documentId);

        } catch (Exception e) {
            log.error("===== Document Pipeline FAILED for documentId: {} =====", documentId, e);
        } finally {
            log.info("===== Document Pipeline END for documentId: {} =====", documentId);
        }
    }

    @Transactional
    public void saveTranslationsAndDocUnits(Long documentId, List<TranslationPair> translationPairs, String targetLang, boolean overwrite) {
        log.info("saveTranslationsAndDocUnits start: documentId {}, pairs={}", documentId, translationPairs.size());

        if (translationPairs.isEmpty()) {
            log.warn("documentId {} - no translation pairs. skipping save.", documentId);
            return;
        }

        if (overwrite) {
            log.info("documentId {} - Overwrite enabled: deleting existing doc_units and doc_unit_translations.", documentId);
            docUnitTranslationRepository.deleteByDocUnitDocumentId(documentId);
            docUnitsRepository.deleteByDocumentId(documentId);
        } else {
            log.info("documentId {} - Overwrite disabled: keeping existing data.", documentId);
        }

        List<docUnitsEntity> newDocUnits = new ArrayList<>();
        List<DocUnitTranslation> newTranslations = new ArrayList<>();
        int orderInDoc = 0;
        int totalPairs = translationPairs.size();

        for (int i = 0; i < totalPairs; i++) {
            TranslationPair pair = translationPairs.get(i);

            docUnitsEntity docUnit = docUnitsEntity.builder()
                    .documentId(documentId)
                    .sourceText(pair.source())
                    .status(UnitStatus.TRANSLATED)
                    .unitType(UnitType.SENTENCE)
                    .orderInDoc(orderInDoc++)
                    .build();
            newDocUnits.add(docUnit);
        }
        docUnitsRepository.saveAll(newDocUnits);
        log.info("documentId {} - saved {} doc_units", documentId, newDocUnits.size());

        for (docUnitsEntity docUnit : newDocUnits) {
            TranslationPair matchingPair = translationPairs.get(docUnit.getOrderInDoc());

            DocUnitTranslation translation = DocUnitTranslation.builder()
                    .docUnit(docUnit)
                    .targetLang(targetLang)
                    .translatedText(matchingPair.translated())
                    .build();
            newTranslations.add(translation);
        }
        docUnitTranslationRepository.saveAll(newTranslations);
        log.info("documentId {} - saved {} translations", documentId, newTranslations.size());
        log.info("saveTranslationsAndDocUnits done: documentId {}", documentId);
    }

    private List<String> splitToSentences(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return Collections.emptyList();
        }

        String normalized = rawText.replace("\r\n", "\n").replace("\r", "\n");

        // Merge hard line breaks inside paragraphs to avoid splitting mid-sentence.
        StringBuilder merged = new StringBuilder(normalized.length());
        String[] lines = normalized.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) {
                continue;
            }

            // Handle hyphenated line breaks: "exam-" + "ple" -> "example"
            if (line.endsWith("-") && i + 1 < lines.length) {
                String next = lines[i + 1].trim();
                if (!next.isEmpty()) {
                    merged.append(line, 0, line.length() - 1);
                    continue;
                }
            }

            merged.append(line);

            // If line does not look like a sentence end, join with space.
            char last = line.charAt(line.length() - 1);
            if (last == '.' || last == '!' || last == '?' || last == '"' || last == '\'' || last == ')') {
                merged.append(' ');
            } else {
                merged.append(' ');
            }
        }

        String mergedText = merged.toString().replaceAll("\\s+", " ").trim();
        if (mergedText.isEmpty()) {
            return Collections.emptyList();
        }

        // Simple sentence split for English text.
        List<String> sentences = new ArrayList<>();
        String[] parts = mergedText.split("(?<=[.!?])\\s+");
        for (String part : parts) {
            String s = part.trim();
            if (!s.isEmpty()) {
                sentences.add(s);
            }
        }
        return sentences;
    }

    private void processTranslationInBatches(
            Long documentId,
            List<String> sentences,
            String targetLang,
            boolean overwrite,
            int batchSize
    ) {
        if (CollectionUtils.isEmpty(sentences)) {
            log.warn("documentId {} - no sentences after split. abort.", documentId);
            return;
        }

        if (overwrite) {
            log.info("documentId {} - Overwrite enabled: deleting existing doc_units and doc_unit_translations.", documentId);
            docUnitTranslationRepository.deleteByDocUnitDocumentId(documentId);
            docUnitsRepository.deleteByDocumentId(documentId);
        } else {
            log.info("documentId {} - Overwrite disabled: keeping existing data.", documentId);
        }

        // Pre-save doc_units with TRANSLATING status
        List<docUnitsEntity> newDocUnits = new ArrayList<>(sentences.size());
        int orderInDoc = 0;
        for (String sentence : sentences) {
            docUnitsEntity docUnit = docUnitsEntity.builder()
                    .documentId(documentId)
                    .sourceText(sentence)
                    .status(UnitStatus.TRANSLATING)
                    .unitType(UnitType.SENTENCE)
                    .orderInDoc(orderInDoc++)
                    .build();
            newDocUnits.add(docUnit);
        }
        docUnitsRepository.saveAll(newDocUnits);
        log.info("documentId {} - saved {} doc_units", documentId, newDocUnits.size());

        // Translate in batches and save immediately
        int total = newDocUnits.size();
        int start = 0;
        int batchIndex = 0;
        while (start < total) {
            int end = Math.min(start + batchSize, total);
            List<docUnitsEntity> batchUnits = newDocUnits.subList(start, end);
            List<String> batchSentences = batchUnits.stream()
                    .map(docUnitsEntity::getSourceText)
                    .collect(Collectors.toList());

            try {
                List<String> translated = openAiTranslator.translateSentences(batchSentences, targetLang);
                if (translated.size() != batchSentences.size()) {
                    throw new IllegalStateException("translation size mismatch: expected=" + batchSentences.size() + ", actual=" + translated.size());
                }

                List<DocUnitTranslation> newTranslations = new ArrayList<>(batchUnits.size());
                for (int i = 0; i < batchUnits.size(); i++) {
                    docUnitsEntity docUnit = batchUnits.get(i);
                    DocUnitTranslation translation = DocUnitTranslation.builder()
                            .docUnit(docUnit)
                            .targetLang(targetLang)
                            .translatedText(translated.get(i))
                            .build();
                    newTranslations.add(translation);
                    docUnit.updateStatus(UnitStatus.TRANSLATED);
                }

                docUnitTranslationRepository.saveAll(newTranslations);
                docUnitsRepository.saveAll(batchUnits);
                log.info("documentId {} - batch {} saved ({}/{})", documentId, batchIndex, end, total);

            } catch (Exception e) {
                log.error("documentId {} - batch {} translation failed. start={}, end={}", documentId, batchIndex, start, end, e);
                for (docUnitsEntity docUnit : batchUnits) {
                    docUnit.updateStatus(UnitStatus.FAILED);
                }
                docUnitsRepository.saveAll(batchUnits);
            }

            start = end;
            batchIndex++;
        }
    }

    @org.springframework.scheduling.annotation.Async("documentPipelineExecutor")
    public void processDocumentAsync(Long documentId, boolean overwrite) {
        log.info("[Async Start] documentId {} pipeline start. Overwrite: {}", documentId, overwrite);
        processDocument(documentId, overwrite);
        log.info("[Async End] documentId {} pipeline end.", documentId);
    }

    @Transactional(readOnly = true)
    public List<swyp.paperdot.document.dto.DocumentTranslationPairResponse> getTranslationPairsForDocument(Long documentId) {
        List<docUnitsEntity> docUnits = docUnitsRepository.findByDocumentIdOrderByOrderInDocAsc(documentId);

        if (CollectionUtils.isEmpty(docUnits)) {
            log.warn("documentId {} - no doc_units found.", documentId);
            return Collections.emptyList();
        }

        List<DocUnitTranslation> translations = docUnitTranslationRepository.findByDocUnitDocumentId(documentId);
        Map<Long, String> translatedTextMap = translations.stream()
                .collect(Collectors.toMap(
                        dt -> dt.getDocUnit().getId(),
                        DocUnitTranslation::getTranslatedText
                ));

        return docUnits.stream()
                .map(docUnit -> swyp.paperdot.document.dto.DocumentTranslationPairResponse.builder()
                        .docUnitId(docUnit.getId())
                        .sourceText(docUnit.getSourceText())
                        .translatedText(translatedTextMap.getOrDefault(docUnit.getId(), ""))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public swyp.paperdot.document.dto.DocumentTranslationProgressResponse getTranslationProgress(Long documentId) {
        long total = docUnitsRepository.countByDocumentId(documentId);
        long translated = docUnitsRepository.countByDocumentIdAndStatus(documentId, UnitStatus.TRANSLATED);
        long translating = docUnitsRepository.countByDocumentIdAndStatus(documentId, UnitStatus.TRANSLATING);
        long created = docUnitsRepository.countByDocumentIdAndStatus(documentId, UnitStatus.CREATED);
        long failed = docUnitsRepository.countByDocumentIdAndStatus(documentId, UnitStatus.FAILED);

        return swyp.paperdot.document.dto.DocumentTranslationProgressResponse.builder()
                .total(total)
                .translated(translated)
                .translating(translating)
                .created(created)
                .failed(failed)
                .build();
    }
}
