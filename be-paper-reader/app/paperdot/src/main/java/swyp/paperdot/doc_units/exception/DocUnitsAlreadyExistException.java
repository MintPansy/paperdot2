package swyp.paperdot.doc_units.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 덮어쓰기(overwrite)가 허용되지 않은 상태에서 DocUnit을 중복 생성하려고 할 때 발생하는 예외입니다.
 * HTTP 409 Conflict 상태 코드에 매핑됩니다.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DocUnitsAlreadyExistException extends RuntimeException {
    public DocUnitsAlreadyExistException(String message) {
        super(message);
    }
}
