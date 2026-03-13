/*
 * [성능 최적화 제안]
 * 대량 데이터 저장을 위해 application.yml 또는 application.properties에
 * 아래와 같이 JPA JDBC 배치 사이즈 설정을 추가하는 것을 강력히 권장합니다.
 * 이 설정을 추가하면 saveAll() 호출 시, 여러 INSERT 문을 모아서 한번의 네트워크 통신으로 DB에 전달하여 성능이 크게 향상됩니다.
 *
 * spring:
 *   jpa:
 *     properties:
 *       hibernate:
 *         jdbc:
 *           batch_size: 500
 *         order_inserts: true
 */
package swyp.paperdot.doc_units.docUnits;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import swyp.paperdot.doc_units.enums.UnitStatus;
import swyp.paperdot.doc_units.enums.UnitType;
import swyp.paperdot.doc_units.exception.DocUnitsAlreadyExistException;
import swyp.paperdot.document.repository.DocumentRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class docUnitsService {

    private final docUnitsRepository docUnitsRepository;
    private final DocumentRepository documentRepository; // Document 존재 여부 확인용

    private static final int CHUNK_SIZE = 500; // 한번에 DB에 저장할 엔티티 개수

    /**
     * 텍스트 리스트를 받아 DocUnit 엔티티로 변환하여 DB에 저장합니다.
     *
     * @param documentId DocUnit과 연결될 부모 문서의 ID
     * @param unitsText 저장할 텍스트 단위(문장 등)의 리스트
     * @param unitType 저장될 DocUnit의 타입 (e.g., SENTENCE)
     * @param overwrite 이미 데이터가 존재할 경우 덮어쓸지 여부
     */
    @Transactional
    public void createUnits(Long documentId, List<String> unitsText, UnitType unitType, boolean overwrite) {
        // 1. 입력값 검증
        if (CollectionUtils.isEmpty(unitsText)) {
            throw new IllegalArgumentException("저장할 텍스트 내용(unitsText)이 비어있습니다.");
        }

        // 2. 부모 문서 존재 여부 확인
        if (!documentRepository.existsById(documentId)) {
            // 프로젝트에 이미 존재하는 DocumentNotFoundException을 재사용하거나,
            // 없다면 우선 IllegalArgumentException으로 처리합니다.
            throw new IllegalArgumentException("해당 ID의 문서를 찾을 수 없습니다: " + documentId);
        }

        // 3. 덮어쓰기(overwrite) 정책 처리
        boolean exists = docUnitsRepository.existsByDocumentId(documentId);
        if (exists && !overwrite) {
            throw new DocUnitsAlreadyExistException("이미 문서 단위(DocUnit)가 존재합니다. documentId: " + documentId);
        }

        if (exists && overwrite) {
            docUnitsRepository.deleteByDocumentId(documentId);
        }

        // 4. 엔티티 생성 및 배치 저장
        List<docUnitsEntity> unitBatch = new ArrayList<>();
        for (int i = 0; i < unitsText.size(); i++) {
            String text = unitsText.get(i);
            int order = i;

            docUnitsEntity unitEntity = docUnitsEntity.builder()
                    .documentId(documentId)
                    .unitType(unitType)
                    .orderInDoc(order)
                    .sourceText(text)
                    .status(UnitStatus.CREATED)
                    .build();

            unitBatch.add(unitEntity);

            // 청크 사이즈에 도달하면 DB에 저장하고 리스트를 비운다.
            if (unitBatch.size() == CHUNK_SIZE) {
                docUnitsRepository.saveAll(unitBatch);
                unitBatch.clear();
            }
        }

        // 마지막에 남은 엔티티들 저장
        if (!unitBatch.isEmpty()) {
            docUnitsRepository.saveAll(unitBatch);
        }
    }
}