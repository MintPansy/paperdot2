package swyp.paperdot.document.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import swyp.paperdot.doc_units.docUnits.docUnitsRepository;
import swyp.paperdot.doc_units.translation.DocUnitTranslationRepository;
import swyp.paperdot.document.domain.Document;
import swyp.paperdot.document.domain.DocumentFile;
import swyp.paperdot.document.dto.DocumentResponse;
import swyp.paperdot.document.dto.DocumentUploadRequest;
import swyp.paperdot.document.exception.DocumentNotFoundException;
import swyp.paperdot.document.note.UserDocNoteRepository;
import swyp.paperdot.document.repository.DocumentRepository;
import swyp.paperdot.document.storage.ObjectStorageClient;
import swyp.paperdot.document.storage.StoragePathParser;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFileService documentFileService;
    private final docUnitsRepository docUnitsRepository;
    private final DocUnitTranslationRepository docUnitTranslationRepository;
    private final UserDocNoteRepository userDocNoteRepository;
    private final ObjectStorageClient objectStorageClient;
    private final StoragePathParser storagePathParser;

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentFileService documentFileService,
            docUnitsRepository docUnitsRepository,
            DocUnitTranslationRepository docUnitTranslationRepository,
            UserDocNoteRepository userDocNoteRepository,
            ObjectStorageClient objectStorageClient,
            StoragePathParser storagePathParser
    ) {
        this.documentRepository = documentRepository;
        this.documentFileService = documentFileService;
        this.docUnitsRepository = docUnitsRepository;
        this.docUnitTranslationRepository = docUnitTranslationRepository;
        this.userDocNoteRepository = userDocNoteRepository;
        this.objectStorageClient = objectStorageClient;
        this.storagePathParser = storagePathParser;
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

    @Transactional
    public void delete(Long documentId, Long requesterId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found: " + documentId));

        if (!document.getOwnerId().equals(requesterId)) {
            throw new IllegalStateException("Forbidden");
        }

        docUnitTranslationRepository.deleteByDocUnitDocumentId(documentId);
        docUnitsRepository.deleteByDocumentId(documentId);
        userDocNoteRepository.deleteByDocumentId(documentId);

        for (DocumentFile file : document.getFiles()) {
            try {
                String key = storagePathParser.getObjectKey(file.getStoragePath());
                objectStorageClient.delete(key);
            } catch (Exception ignored) {
            }
        }

        documentRepository.deleteById(documentId);
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
