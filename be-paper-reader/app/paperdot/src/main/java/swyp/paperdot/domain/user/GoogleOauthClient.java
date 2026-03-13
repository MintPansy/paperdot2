package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class GoogleOauthClient {

    private final RestTemplate restTemplate = new RestTemplate();

    public void revoke(String token) {
        if (token == null || token.isBlank()) return;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("token", token);

        HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(
                    "https://oauth2.googleapis.com/revoke",
                    HttpMethod.POST,
                    req,
                    String.class
            );
        } catch (Exception ignored) {
            // 필요하면 로그만 남기기
        }
    }
}
