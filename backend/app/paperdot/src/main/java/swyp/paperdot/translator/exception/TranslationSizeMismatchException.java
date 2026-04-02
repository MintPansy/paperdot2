package swyp.paperdot.translator.exception;

// 번역 요청 문장 수와 응답 문장 수가 일치하지 않을 때 발생하는 예외
public class TranslationSizeMismatchException extends RuntimeException {
    public TranslationSizeMismatchException(String message) {
        super(message);
    }
}
