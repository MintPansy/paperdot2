package swyp.paperdot.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccountEntity, Long> {
    Optional<SocialAccountEntity> findByProviderAndProviderUserId(SocialProvider provider, String providerUserId);

    Optional<SocialAccountEntity> findByUser_IdAndProvider(Long userId, SocialProvider provider);
    void deleteByUser_Id(Long userId);


}
