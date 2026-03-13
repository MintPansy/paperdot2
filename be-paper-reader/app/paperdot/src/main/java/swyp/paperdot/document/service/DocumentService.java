package swyp.paperdot.document.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import swyp.paperdot.document.domain.Document;
import swyp.paperdot.document.domain.DocumentFile;
import swyp.paperdot.document.dto.DocumentResponse;
import swyp.paperdot.document.dto.DocumentUploadRequest;
import swyp.paperdot.document.repository.DocumentRepository;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFileService documentFileService;

    public DocumentService(DocumentRepository documentRepository, DocumentFileService documentFileService) {
        this.documentRepository = documentRepository;
        this.documentFileService = documentFileService;
    }

    @Transactional
    public DocumentResponse upload(DocumentUploadRequest request) {
        validateUploadRequest(request);

        Document document = new Document(
                request.getOwnerId(),
                request.getTitle(),
                request.getLanguageSrc(),
                request.getLanguageTgt(),
                null
        );

        Document savedDocument = documentRepository.save(document);

        DocumentFile documentFile = documentFileService.uploadOriginalFile(
                request.getOwnerId(),
                savedDocument.getId(),
                request.getFile()
        );

        savedDocument.addFile(documentFile);
        Document updatedDocument = documentRepository.save(savedDocument);

        return new DocumentResponse(
                updatedDocument.getId(),
                documentFile.getId(),
                documentFile.getStoragePath(),
                documentFile.getFileType(),
                updatedDocument.getStatus(),
                documentFile.getOriginalFilename(),
                documentFile.getMimeType(),
                documentFile.getFileSizeBytes()
        );
    }

    private void validateUploadRequest(DocumentUploadRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }
        if (request.getOwnerId() == null) {
            throw new IllegalArgumentException("ownerId is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (request.getLanguageSrc() == null || request.getLanguageSrc().isBlank()) {
            throw new IllegalArgumentException("languageSrc is required");
        }
        if (request.getLanguageTgt() == null || request.getLanguageTgt().isBlank()) {
            throw new IllegalArgumentException("languageTgt is required");
        }
        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new IllegalArgumentException("file is required");
        }
    }
}
