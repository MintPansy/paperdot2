package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class KakaoAdminClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.admin-key}")
    private String kakaoAdminKey;

    public void logoutByProviderUserId(String providerUserId) {
        postForm("https://kapi.kakao.com/v1/user/logout", providerUserId);
    }

    public void unlinkByProviderUserId(String providerUserId) {
        postForm("https://kapi.kakao.com/v1/user/unlink", providerUserId);
    }

    private void postForm(String url, String providerUserId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoAdminKey);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("target_id_type", "user_id");
        body.add("target_id", providerUserId);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        restTemplate.exchange(url, HttpMethod.POST, request, String.class);
    }
}
