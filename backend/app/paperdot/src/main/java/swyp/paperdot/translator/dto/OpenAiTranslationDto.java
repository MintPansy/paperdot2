package swyp.paperdot.translator.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// OpenAI Chat Completions API와의 통신을 위한 DTO들을 정의합니다.
// 외부 클래스로 정의하여 재사용성을 높일 수 있지만, 여기서는 내부 클래스로 간단히 구성합니다.
public class OpenAiTranslationDto {

    // API 요청 시 Body에 담길 내용
    public record ChatRequest(
            String model,
            List<Message> messages,
            @JsonProperty("response_format") ResponseFormat responseFormat
    ) {
        // responseFormat을 명시적으로 지정하는 경우
        public static ChatRequest of(String model, List<Message> messages, ResponseFormat responseFormat) {
            return new ChatRequest(model, messages, responseFormat);
        }

        // responseFormat 없이 호출하는 경우 (기본값 null)
        public static ChatRequest of(String model, List<Message> messages) {
            return new ChatRequest(model, messages, null); // responseFormat을 null로 설정
        }
    }

    // 요청/응답에 사용될 메시지 구조
    public record Message(
            String role,
            String content
    ) {}

    // JSON 응답 모드를 활성화하기 위한 객체
    public record ResponseFormat(
            String type
    ) {}

    // API 응답 Body 구조
    @Getter
    @NoArgsConstructor
    public static class ChatResponse {
        private List<Choice> choices;
    }

    // 응답 내용 상세 구조
    @Getter
    @NoArgsConstructor
    public static class Choice {
        private Message message;
    }

    // 원본 문장과 번역된 문장 쌍을 위한 DTO
    public record TranslationPair(String source, String translated) {}
}
