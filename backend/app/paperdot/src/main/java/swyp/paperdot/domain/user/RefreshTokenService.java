package swyp.paperdot.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public String sha256(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void store(UserEntity user, String refreshToken, OffsetDateTime expiresAt) {
        RefreshTokenEntity entity = RefreshTokenEntity.builder()
                .user(user)
                .tokenHash(sha256(refreshToken))
                .expiresAt(expiresAt)
                .revoked(false)
                .build();
        refreshTokenRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public RefreshTokenEntity getValid(String refreshToken) {
        String hash = sha256(refreshToken);
        RefreshTokenEntity entity = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (entity.isRevoked()) throw new IllegalArgumentException("Refresh token revoked");
        if (entity.getExpiresAt().isBefore(OffsetDateTime.now())) throw new IllegalArgumentException("Refresh token expired");

        return entity;
    }

    @Transactional
    public void revoke(String refreshToken) {
        String hash = sha256(refreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevoked(true);
        });
    }

    @Transactional
    public void revokeAllByUser(Long userId) {
        refreshTokenRepository.deleteByUser_Id(userId);
    }
}
