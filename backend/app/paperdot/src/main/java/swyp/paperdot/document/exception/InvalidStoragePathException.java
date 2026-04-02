package swyp.paperdot.document.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * DB에 저장된 storagePath의 형식이 예상과 다를 때 발생하는 예외입니다.
 * 이는 데이터 정합성 문제를 의미하므로 HTTP 500 Internal Server Error에 매핑됩니다.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class InvalidStoragePathException extends RuntimeException {
    public InvalidStoragePathException(String message) {
        super(message);
    }
}
