package swyp.paperdot.document.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swyp.paperdot.document.dto.DocumentTranslationHistoryItemResponse;
import swyp.paperdot.document.repository.DocumentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentHistoryService {

    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public List<DocumentTranslationHistoryItemResponse> getTranslationHistory(Long ownerId) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId is required");
        }
        return documentRepository.findTranslationHistoryByOwnerId(ownerId);
    }
}
