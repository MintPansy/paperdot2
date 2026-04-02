package swyp.paperdot.doc_units.translation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import swyp.paperdot.doc_units.docUnits.docUnitsEntity;

import java.time.Instant;

/**
 * 번역된 DocUnit 조각을 저장하는 엔티티입니다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "doc_unit_translations")
public class DocUnitTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 원본 DocUnit과 다대일 관계. 원본이 삭제되면 번역본도 함께 삭제될 수 있도록 cascade 옵션을 설정할 수 있습니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_unit_id", nullable = false)
    private docUnitsEntity docUnit;

    @Column(nullable = false)
    private String targetLang;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String translatedText;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Builder
    public DocUnitTranslation(docUnitsEntity docUnit, String targetLang, String translatedText) {
        this.docUnit = docUnit;
        this.targetLang = targetLang;
        this.translatedText = translatedText;
    }
}
