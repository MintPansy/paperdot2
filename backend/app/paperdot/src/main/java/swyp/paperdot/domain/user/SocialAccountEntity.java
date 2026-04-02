package swyp.paperdot.domain.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(
        name = "social_accounts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_provider_provider_user", columnNames = {"provider", "provider_user_id"})
        }
)
public class SocialAccountEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SocialProvider provider;

    @Column(name = "provider_user_id", nullable = false, length = 255)
    private String providerUserId;

    @Column(name = "linked_at")
    private OffsetDateTime linkedAt;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    //구글 revoke용
    @Column(name = "provider_refresh_token", length = 2000)
    private String providerRefreshToken;

    //구글 fallback용 (refresh 없을 때 revoke 시도)
    @Column(name = "provider_access_token", length = 2000)
    private String providerAccessToken;

    @PrePersist
    void onCreate() {
        var now = OffsetDateTime.now();
        this.linkedAt = (this.linkedAt == null) ? now : this.linkedAt;
        this.lastLoginAt = (this.lastLoginAt == null) ? now : this.lastLoginAt;
    }
}
