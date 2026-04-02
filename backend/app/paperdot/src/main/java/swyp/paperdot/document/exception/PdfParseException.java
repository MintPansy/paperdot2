package swyp.paperdot.document.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * PDF 파일을 파싱하거나 텍스트를 추출하는 과정에서 오류가 발생했을 때 사용하는 예외입니다.
 * 손상된 파일, 암호화된 파일, 지원하지 않는 형식 등이 원인이 될 수 있습니다.
 * 클라이언트가 잘못된 파일을 업로드했을 가능성을 고려하여 HTTP 400 Bad Request에 매핑합니다.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PdfParseException extends RuntimeException {
    public PdfParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
