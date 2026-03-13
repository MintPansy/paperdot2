package swyp.paperdot.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * 나가는 요청에 OpenAI API 키를 추가하기 위해 인터셉터를 사용하여
 * RestTemplate을 설정하는 구성 클래스입니다.
 */
@Configuration
public class RestTemplateConfig {

    // application.yml에서 OpenAI API 키를 주입합니다.
    @Value("${openai.api.key:}")
    private String openaiApiKey;

    /**
     * RestTemplate 빈을 구성하고 제공합니다.
     * 이 RestTemplate을 사용하여 생성된 모든 요청에 대해 OpenAI API 키와 함께
     * Authorization 헤더를 자동으로 포함하도록 인터셉터가 추가됩니다.
     * @return 구성된 RestTemplate 인스턴스.
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // API 키와 함께 Authorization 헤더를 포함하도록 인터셉터를 추가합니다.
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("Authorization", "Bearer " + openaiApiKey);
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
