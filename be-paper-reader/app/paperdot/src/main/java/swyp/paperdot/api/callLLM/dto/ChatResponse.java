package swyp.paperdot.api.callLLM.dto;

import lombok.Data;

import java.util.List;

/**
 * 채팅 요청에 대해 LLM으로부터 받은 응답을 나타냅니다.
 */
@Data
public class ChatResponse {
    private List<Choice> choices; // LLM이 생성한 선택지 목록

    /**
     * LLM 응답의 단일 선택지를 나타냅니다.
     */
    @Data
    public static class Choice {
        private int index;      // 선택지 목록에서 이 선택지의 인덱스
        private Message message; // 이 선택지의 메시지 내용
    }
}
