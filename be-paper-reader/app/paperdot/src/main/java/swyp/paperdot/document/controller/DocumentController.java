package swyp.paperdot.document.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import swyp.paperdot.document.dto.DocumentResponse;
import swyp.paperdot.document.dto.DocumentUploadRequest;
import swyp.paperdot.document.service.DocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/documents")
@Tag(name = "Document", description = "문서 업로드 및 저장 API")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Operation(
            summary = "문서 업로드",
            description = "PDF 문서를 오브젝트 스토리지에 업로드하고 메타데이터를 저장합니다."
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse upload(@ModelAttribute DocumentUploadRequest request) {
        return documentService.upload(request);
    }
}
