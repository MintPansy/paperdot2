package swyp.paperdot.document.dto;

import swyp.paperdot.document.enums.DocumentFileType;
import swyp.paperdot.document.enums.DocumentStatus;

public class DocumentResponse {

    private final Long documentId;
    private final Long fileId;
    private final String storagePath;
    private final DocumentFileType fileType;
    private final DocumentStatus status;
    private final String originalFilename;
    private final String mimeType;
    private final Long fileSizeBytes;

    public DocumentResponse(
            Long documentId,
            Long fileId,
            String storagePath,
            DocumentFileType fileType,
            DocumentStatus status,
            String originalFilename,
            String mimeType,
            Long fileSizeBytes
    ) {
        this.documentId = documentId;
        this.fileId = fileId;
        this.storagePath = storagePath;
        this.fileType = fileType;
        this.status = status;
        this.originalFilename = originalFilename;
        this.mimeType = mimeType;
        this.fileSizeBytes = fileSizeBytes;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public Long getFileId() {
        return fileId;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public DocumentFileType getFileType() {
        return fileType;
    }

    public DocumentStatus getStatus() {
        return status;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }
}
