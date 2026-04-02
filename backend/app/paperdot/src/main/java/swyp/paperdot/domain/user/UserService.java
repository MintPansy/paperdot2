package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;

    @Transactional
    public UserEntity upsertSocialUser(
            SocialProvider provider,
            String providerUserId,
            String email,
            String nickname,
            String profileImageUrl
    ) {
        // 1) 소셜 계정 기준으로 먼저 찾기
        var socialOpt = socialAccountRepository.findByProviderAndProviderUserId(provider, providerUserId);
        if (socialOpt.isPresent()) {
            SocialAccountEntity social = socialOpt.get();
            social.setLastLoginAt(OffsetDateTime.now());

            // 유저 정보 업데이트(원하면 더 엄격하게)
            UserEntity user = social.getUser();
            if (email != null && (user.getEmail() == null || user.getEmail().isBlank())) user.setEmail(email);
            if (nickname != null) user.setNickname(nickname);
            if (profileImageUrl != null) user.setProfileImageUrl(profileImageUrl);

            return user;
        }

        // 2) 신규: 유저 생성
        UserEntity user = UserEntity.builder()
                .email(email)
                .nickname(nickname)
                .profileImageUrl(profileImageUrl)
                .build();
        userRepository.save(user);

        // 3) 소셜 계정 생성
        SocialAccountEntity social = SocialAccountEntity.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerUserId)
                .linkedAt(OffsetDateTime.now())
                .lastLoginAt(OffsetDateTime.now())
                .build();
        socialAccountRepository.save(social);

        return user;
    }
}
