package swyp.paperdot.document.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 외부 스토리지(NCP Object Storage 등)에서 파일 다운로드 중 오류가 발생했을 때 사용하는 예외입니다.
 * 외부 서비스 장애에 해당하므로 HTTP 503 Service Unavailable에 매핑하는 것을 고려할 수 있습니다.
 */
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class StorageDownloadException extends RuntimeException {
    public StorageDownloadException(String message, Throwable cause) {
        super(message, cause);
    }
}
