package swyp.paperdot.document.domain;

import swyp.paperdot.document.enums.DocumentFileType;
import swyp.paperdot.document.enums.StorageProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "document_files",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"document_id", "file_type"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 문서의 파일인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentFileType fileType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StorageProvider storageProvider;

    @Column(nullable = false)
    private String originalFilename;

    @Column(nullable = false)
    private String storagePath;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(length = 64, nullable = false)
    private String checksumSha256;

    @Column(nullable = false)
    private Instant uploadedAt;

    /* ===== 생성 메서드 ===== */
    public static DocumentFile create(
            DocumentFileType fileType,
            StorageProvider storageProvider,
            String originalFilename,
            String storagePath,
            String mimeType,
            Long fileSizeBytes,
            String checksumSha256
    ) {
        DocumentFile file = new DocumentFile();
        file.fileType = fileType;
        file.storageProvider = storageProvider;
        file.originalFilename = originalFilename;
        file.storagePath = storagePath;
        file.mimeType = mimeType;
        file.fileSizeBytes = fileSizeBytes;
        file.checksumSha256 = checksumSha256;
        file.uploadedAt = Instant.now();
        return file;
    }

    /* package-private */
    void setDocument(Document document) {
        this.document = document;
    }
}
