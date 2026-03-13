package swyp.paperdot.document.storage;

import org.springframework.stereotype.Component;
import swyp.paperdot.document.exception.InvalidStoragePathException;

/**
 * NCP Object Storage의 경로(storagePath) 문자열을 파싱하는 유틸리티 클래스입니다.
 * DB에 저장된 "ncloud://{bucket-name}/{object-key}" 형식의 문자열을
 * 버킷 이름과 객체 키로 분리하는 역할을 담당합니다.
 *
 * @Component 어노테이션을 통해 Spring 컨테이너에 Bean으로 등록되어 다른 서비스에서 주입받아 사용할 수 있습니다.
 */
@Component
public class NcpStoragePathParser {

    private static final String PROTOCOL = "ncloud://";

    /**
     * 스토리지 경로에서 객체 키를 추출합니다.
     * 다운로드 시 실제 파일 위치를 찾는 데 사용됩니다.
     *
     * @param storagePath "ncloud://{bucket-name}/{object-key}" 형식의 전체 경로
     * @return 객체 키 (e.g., "documents/1/1/original/...")
     * @throws InvalidStoragePathException 경로 형식이 잘못되었거나, 객체 키 부분을 추출할 수 없는 경우
     */
    public String getObjectKey(String storagePath) {
        validatePath(storagePath);
        int keyStartIndex = storagePath.indexOf('/', PROTOCOL.length());

        // "ncloud://bucket-name/" 형태처럼 key가 비어있는 경우를 방지
        if (keyStartIndex == -1 || keyStartIndex + 1 >= storagePath.length()) {
            throw new InvalidStoragePathException("Invalid storage path format: Cannot find object key part. path=" + storagePath);
        }
        return storagePath.substring(keyStartIndex + 1);
    }

    /**
     * 경로가 유효한 "ncloud://" 프로토콜로 시작하는지 검증합니다.
     *
     * @param storagePath 검증할 스토리지 경로
     * @throws InvalidStoragePathException 경로가 null이거나 프로토콜이 맞지 않는 경우
     */
    private void validatePath(String storagePath) {
        if (storagePath == null || !storagePath.startsWith(PROTOCOL)) {
            throw new InvalidStoragePathException("Invalid storage path format: Must start with 'ncloud://'. path=" + storagePath);
        }
    }
}
