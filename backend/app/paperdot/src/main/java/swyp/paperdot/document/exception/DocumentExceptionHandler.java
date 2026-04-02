package swyp.paperdot.document.exception;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class DocumentExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(DocumentExceptionHandler.class);

    @ExceptionHandler(DocumentNotFoundException.class)
    public ResponseEntity<DocumentErrorResponse> handleNotFound(DocumentNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<DocumentErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(StorageUploadException.class)
    public ResponseEntity<DocumentErrorResponse> handleStorageFailure(StorageUploadException ex) {
        log.error("[Storage] 업로드 실패: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.BAD_GATEWAY.value(), ex.getMessage()));
    }

    // 예상치 못한 예외는 500 대신 로그를 남기고 명시적 에러 응답 반환
    @ExceptionHandler(Exception.class)
    public ResponseEntity<DocumentErrorResponse> handleUnexpected(Exception ex) {
        log.error("[Document] 처리 중 예외 발생: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "서버 오류가 발생했습니다: " + ex.getMessage()));
    }
}
