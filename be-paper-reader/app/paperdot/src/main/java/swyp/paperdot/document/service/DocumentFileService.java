package swyp.paperdot.document.service;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import swyp.paperdot.document.domain.DocumentFile;
import swyp.paperdot.document.enums.DocumentFileType;
import swyp.paperdot.document.enums.StorageProvider;
import swyp.paperdot.document.exception.StorageUploadException;
import swyp.paperdot.document.storage.ObjectStorageClient;

@Service
public class DocumentFileService {

    private static final String BASE_PREFIX = "documents";

    private final ObjectStorageClient objectStorageClient;

    public DocumentFileService(ObjectStorageClient objectStorageClient) {
        this.objectStorageClient = objectStorageClient;
    }

    public DocumentFile uploadOriginalFile(Long ownerId, Long documentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String originalFilename = normalizeFilename(file.getOriginalFilename());
        String contentType = normalizeContentType(file.getContentType());
        String storedName = buildStoredName(originalFilename);
        String key = buildObjectKey(ownerId, documentId, "original", storedName);

        String checksum = sha256Hex(file);

        try {
            objectStorageClient.upload(key, file, contentType);
        } catch (IOException | RuntimeException e) {
            // AWS SDK v2는 SdkException(RuntimeException)을 던지므로 함께 처리
            throw new StorageUploadException("Failed to upload file to object storage", e);
        }

        return DocumentFile.create(
                DocumentFileType.ORIGINAL_PDF,
                objectStorageClient.getProvider(),
                originalFilename,
                storedName,
                buildStoragePath(objectStorageClient.getBucket(), key),
                contentType,
                file.getSize(),
                checksum
        );
    }

    private String buildObjectKey(Long ownerId, Long documentId, String folder, String storedName) {
        return String.format(
                Locale.ROOT,
                "%s/%d/%d/%s/%s",
                BASE_PREFIX,
                ownerId,
                documentId,
                folder,
                storedName
        );
    }

    private String buildStoredName(String originalFilename) {
        String extension = extractExtension(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return extension.isEmpty() ? uuid : uuid + extension;
    }

    private String buildStoragePath(String bucket, String key) {
        StorageProvider provider = objectStorageClient.getProvider();
        return switch (provider) {
            case S3 -> "s3://" + bucket + "/" + key;
            case LOCAL -> "local://" + bucket + "/" + key;
            case NCLOUD -> "ncloud://" + bucket + "/" + key;
        };
    }

    private String normalizeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "upload.bin";
        }
        return originalFilename;
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType;
    }

    private String extractExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDot);
    }

    private String sha256Hex(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream inputStream = file.getInputStream()) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, read);
                }
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new IllegalStateException("Failed to calculate checksum", e);
        }
    }
}
