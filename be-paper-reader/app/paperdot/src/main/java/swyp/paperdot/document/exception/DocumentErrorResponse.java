package swyp.paperdot.document.exception;

import java.time.Instant;

public class DocumentErrorResponse {

    private final Instant timestamp;
    private final int status;
    private final String message;

    public DocumentErrorResponse(Instant timestamp, int status, String message) {
        this.timestamp = timestamp;
        this.status = status;
        this.message = message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
