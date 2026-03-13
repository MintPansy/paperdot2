package swyp.paperdot.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 애플리케이션 전반에 사용될 공용 Bean들을 정의하는 클래스입니다.
 */
@Configuration
public class AppConfig {

    /**
     * JSON 직렬화/역직렬화에 사용될 ObjectMapper를 Spring Bean으로 등록합니다.
     * 이 Bean이 등록되면, 다른 컴포넌트에서 @Autowired를 통해 주입받아 사용할 수 있습니다.
     * @return ObjectMapper 인스턴스
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
