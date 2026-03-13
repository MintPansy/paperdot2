package swyp.paperdot.domain.user;

import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserService userService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String providerUserId = oidcUser.getSubject();

        String email = (String) oidcUser.getAttributes().get("email");
        String nickname = (String) oidcUser.getAttributes().get("name");
        String profileImageUrl = (String) oidcUser.getAttributes().get("picture");

        UserEntity user = userService.upsertSocialUser(
                SocialProvider.GOOGLE, providerUserId, email, nickname, profileImageUrl
        );

        Map<String, Object> merged = new HashMap<>(oidcUser.getAttributes());
        merged.put("userId", user.getId());
        merged.put("provider", "GOOGLE");

        // OidcUser 래핑해서 attributes만 확장
        return new OidcUser() {
            @Override public Map<String, Object> getAttributes() { return merged; }
            @Override public Map<String, Object> getClaims() { return oidcUser.getClaims(); }
            @Override public Collection<? extends GrantedAuthority> getAuthorities() { return oidcUser.getAuthorities(); }
            @Override public String getName() { return oidcUser.getName(); }

            @Override public @Nullable OidcUserInfo getUserInfo() { return oidcUser.getUserInfo(); }
            @Override public @Nullable OidcIdToken getIdToken() { return oidcUser.getIdToken(); }
        };
    }
}
