package swyp.paperdot.document.note;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import swyp.paperdot.common.JwtAuthFilter;
import swyp.paperdot.document.note.dto.UserDocNoteRequest;
import swyp.paperdot.document.note.dto.UserDocNoteResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents/{documentId}/notes")
@RequiredArgsConstructor
@Tag(name = "문서 메모/하이라이트", description = "문단 단위 메모 및 하이라이트 저장 API")
public class UserDocNoteController {

    private final UserDocNoteService userDocNoteService;

    private static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof JwtAuthFilter.PaperdotPrincipal principal)) {
            throw new IllegalStateException("Unauthorized");
        }
        return principal.userId();
    }

    @Operation(summary = "메모/하이라이트 목록 조회")
    @GetMapping
    public ResponseEntity<List<UserDocNoteResponse>> list(@PathVariable Long documentId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userDocNoteService.getNotes(documentId, userId));
    }

    @Operation(summary = "메모/하이라이트 추가")
    @PostMapping
    public ResponseEntity<UserDocNoteResponse> create(
            @PathVariable Long documentId,
            @RequestBody UserDocNoteRequest request
    ) {
        Long userId = getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(userDocNoteService.create(documentId, userId, request));
    }

    @Operation(summary = "메모/하이라이트 수정")
    @PutMapping("/{noteId}")
    public ResponseEntity<UserDocNoteResponse> update(
            @PathVariable Long documentId,
            @PathVariable Long noteId,
            @RequestBody UserDocNoteRequest request
    ) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(userDocNoteService.update(documentId, noteId, userId, request));
    }

    @Operation(summary = "메모/하이라이트 삭제")
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long documentId,
            @PathVariable Long noteId
    ) {
        Long userId = getCurrentUserId();
        userDocNoteService.delete(documentId, noteId, userId);
        return ResponseEntity.noContent().build();
    }
}
