package swyp.paperdot.document.domain;

import swyp.paperdot.document.enums.DocumentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 문서 소유자 (User.id)
    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private String title;

    // 원본 / 번역 언어
    @Column(length = 2, nullable = false)
    private String languageSrc;

    @Column(length = 2, nullable = false)
    private String languageTgt;

    // PDF 페이지 수
    private Integer totalPages;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status;

    private Instant lastOpenedAt;

    // 문서에 딸린 파일들
    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DocumentFile> files = new ArrayList<>();

    /* ===== 생성자 ===== */
    public Document(
            Long ownerId,
            String title,
            String languageSrc,
            String languageTgt,
            Integer totalPages
    ) {
        this.ownerId = ownerId;
        this.title = title;
        this.languageSrc = languageSrc;
        this.languageTgt = languageTgt;
        this.totalPages = totalPages;
        this.status = DocumentStatus.UPLOADED;
    }

    /* ===== 연관관계 편의 메서드 ===== */
    public void addFile(DocumentFile file) {
        files.add(file);
        file.setDocument(this);
    }
}
