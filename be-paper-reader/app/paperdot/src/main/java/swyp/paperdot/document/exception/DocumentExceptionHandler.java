package swyp.paperdot.document.exception;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class DocumentExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<DocumentErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(StorageUploadException.class)
    public ResponseEntity<DocumentErrorResponse> handleStorageFailure(StorageUploadException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(new DocumentErrorResponse(Instant.now(), HttpStatus.BAD_GATEWAY.value(), ex.getMessage()));
    }
}
