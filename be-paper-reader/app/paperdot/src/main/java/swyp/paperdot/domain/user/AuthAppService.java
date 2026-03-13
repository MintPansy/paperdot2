package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthAppService {

    private final RefreshTokenService refreshTokenService;
    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final KakaoAdminClient kakaoAdminClient;
    private final GoogleOauthClient googleOAuthClient;

    // 공통 로그아웃
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.revokeAllByUser(userId);

        socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.KAKAO)
                .ifPresent(sa -> kakaoAdminClient.logoutByProviderUserId(sa.getProviderUserId()));
    }

    // 카카오 회원탈퇴(연결끊기 + DB 삭제)
    @Transactional
    public void withdrawKakao(Long userId) {
        socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.KAKAO)
                .ifPresent(sa -> kakaoAdminClient.unlinkByProviderUserId(sa.getProviderUserId()));

        deleteLocalUserData(userId);
    }

    // 구글 회원탈퇴(구글 revoke + DB 삭제)
    @Transactional
    public void withdrawGoogle(Long userId) {
        socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.GOOGLE)
                .ifPresent(sa -> {
                    // refresh 우선 (완성형)
                    String refresh = sa.getProviderRefreshToken();
                    if (refresh != null && !refresh.isBlank()) {
                        googleOAuthClient.revoke(refresh);
                        return;
                    }

                    // fallback: refresh가 없으면 access라도 revoke 시도(선택)
                    String access = sa.getProviderAccessToken();
                    if (access != null && !access.isBlank()) {
                        googleOAuthClient.revoke(access);
                    }
                });

        deleteLocalUserData(userId);
    }

    private void deleteLocalUserData(Long userId) {
        refreshTokenService.revokeAllByUser(userId);
        socialAccountRepository.deleteByUser_Id(userId);
        userRepository.deleteById(userId);
    }
}

