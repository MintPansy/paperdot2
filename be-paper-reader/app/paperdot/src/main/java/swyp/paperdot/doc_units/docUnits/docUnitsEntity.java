package swyp.paperdot.doc_units.docUnits;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import swyp.paperdot.doc_units.enums.UnitStatus;
import swyp.paperdot.doc_units.enums.UnitType;

import java.time.Instant;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "doc_units")
public class docUnitsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    /*
     * [옵션] @ManyToOne 연관관계 매핑 제안
     * 현재는 documentId만 Long 타입으로 저장하여 다른 엔티티 수정 없이 구현합니다.
     * 추후 JPQL 등에서 JOIN이 필요하거나 객체지향적으로 다루고 싶을 경우,
     * 아래와 같이 @ManyToOne 연관관계를 설정하고 Document 엔티티에 @OneToMany를 추가할 수 있습니다.
     *
     * @ManyToOne(fetch = FetchType.LAZY)
     * @JoinColumn(name = "document_id")
     * private Document document;
     */

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitType unitType;

    @Column(nullable = false)
    private Integer orderInDoc;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sourceText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;


    @Builder
    public docUnitsEntity(Long documentId, UnitType unitType, Integer orderInDoc, String sourceText, UnitStatus status) {
        this.documentId = documentId;
        this.unitType = unitType;
        this.orderInDoc = orderInDoc;
        this.sourceText = sourceText;
        this.status = status;
    }

    public void updateStatus(UnitStatus status) {
        this.status = status;
    }
}