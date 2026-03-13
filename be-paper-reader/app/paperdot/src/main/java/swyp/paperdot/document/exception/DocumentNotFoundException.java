package swyp.paperdot.document.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 요청한 리소스(특히 Document 또는 DocumentFile)를 찾을 수 없을 때 발생하는 예외입니다.
 * HTTP 404 Not Found 상태 코드에 매핑됩니다.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class DocumentNotFoundException extends RuntimeException {
    public DocumentNotFoundException(String message) {
        super(message);
    }
}
