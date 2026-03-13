package swyp.paperdot.api.callLLM.dto;

import lombok.Data;

import java.util.List;

/**
 * LLM에 채팅 메시지를 보내기 위한 요청 본문을 나타냅니다.
 */
@Data
public class ChatRequest {
    private String model;           // 사용할 모델의 ID (예: "gpt-5-mini")
    private List<Message> messages; // 대화 기록을 구성하는 메시지 목록

    /**
     * 지정된 모델과 메시지 목록으로 채팅 요청을 생성하기 위한 생성자입니다.
     * @param model 사용할 LLM 모델의 이름입니다.
     * @param messages 대화의 일부로 보낼 메시지 목록입니다.
     */
    public ChatRequest(String model, List<Message> messages) {
        this.model = model;
        this.messages = messages;
    }
}
