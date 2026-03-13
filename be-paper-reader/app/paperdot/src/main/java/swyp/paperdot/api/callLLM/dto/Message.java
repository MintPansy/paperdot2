package swyp.paperdot.api.callLLM.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 채팅 대화의 메시지를 나타냅니다.
 * LLM에 메시지를 보내고 응답을 받는 데 모두 사용됩니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String role;    // 메시지 발신자의 역할 (예: "user", "system", "assistant")
    private String content; // 메시지의 실제 내용
}
