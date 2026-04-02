package swyp.paperdot.api.callLLM;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/llm")
@Tag(name = "LLM", description = "LLM 채팅 및 PDF 기반 질의 응답 API")
public class CallLLMController {

    private final CallLLMService callLLMService;

    @Autowired
    public CallLLMController(CallLLMService callLLMService) {
        this.callLLMService = callLLMService;
    }

    @Operation(
            summary = "LLM 채팅",
            description = "일반 텍스트 프롬프트를 보내고 LLM 응답을 반환합니다."
    )
    @PostMapping("/chat")
    public String chat(@RequestBody String prompt) {
        return callLLMService.getChatResponse(prompt);
    }

    @Operation(
            summary = "PDF 기반 LLM 채팅",
            description = "PDF 파일을 업로드하고, 추출된 텍스트 기반으로 LLM 응답을 반환합니다."
    )
    @PostMapping("/chat-pdf")
    public String chatPdf(@RequestParam("file") MultipartFile file) throws IOException {
        return callLLMService.getChatResponseFromPdf(file);
    }
}
