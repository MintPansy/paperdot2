package swyp.paperdot.common;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import swyp.paperdot.domain.user.*;

import jakarta.servlet.http.HttpServletResponse;
import java.time.OffsetDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final CustomOAuth2UserService customOAuth2UserService;
  private final CustomOidcUserService customOidcUserService;

  private final JwtService jwtService;
  private final JwtAuthFilter jwtAuthFilter;
  private final RefreshTokenService refreshTokenService;
  private final UserRepository userRepository;

  private final OAuth2AuthorizedClientService authorizedClientService;
  private final ClientRegistrationRepository clientRegistrationRepository;
  private final SocialAccountRepository socialAccountRepository;
  private final OAuth2AuthorizedClientRepository authorizedClientRepository;

  @Value("${paperdot.frontend.base-url}")
  private String frontendBaseUrl;

  @Value("${paperdot.jwt.refresh-cookie-name}")
  private String refreshCookieName;

  @Bean
  public OAuth2AuthorizationRequestResolver authorizationRequestResolver(
      ClientRegistrationRepository clientRegistrationRepository) {
    DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(
        clientRegistrationRepository,
        "/oauth2/authorization");

    resolver.setAuthorizationRequestCustomizer((OAuth2AuthorizationRequest.Builder builder) -> {
      OAuth2AuthorizationRequest req = builder.build();
      String registrationId = (String) req.getAttributes().get(OAuth2ParameterNames.REGISTRATION_ID);

      if ("google".equals(registrationId)) {
        builder.additionalParameters(params -> {
          params.put("access_type", "offline");
          params.put("prompt", "consent");
        });
      }
    });

    return resolver;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http,
      OAuth2AuthorizationRequestResolver authorizationRequestResolver) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(c -> {
        })
        // formLogin 명시적 비활성화: 활성화 상태면 미인증 요청 시 /login으로 302 redirect 발생
        .formLogin(form -> form.disable())
        .httpBasic(basic -> basic.disable())
        // OAuth2 flow는 세션 필요. API 요청에는 세션 불필요하지만 IF_REQUIRED로 공존
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                HttpMethod.OPTIONS,
                "/**")
            .permitAll()
            .requestMatchers(
                "/oauth2/**",
                "/login/oauth2/**",
                "/auth/token",
                "/auth/logout",
                "/documents",
                "/documents/**",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/api/**")
            .permitAll()
            .anyRequest().authenticated())
        .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
          String requestUri = request.getRequestURI();

          // CORS preflight(OPTIONS)
          if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
          }

          // 모든 API 요청(/documents, /api/**, /auth/**)은 redirect 대신 401 반환
          if (requestUri != null && (requestUri.startsWith("/documents") ||
              requestUri.startsWith("/api/") ||
              requestUri.startsWith("/auth/"))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"Unauthorized\"}");
            return;
          }

          // OAuth2 로그인 페이지로 리다이렉트 (브라우저 직접 접근 시)
          response.sendRedirect("/oauth2/authorization/google");
        }))
        .oauth2Login(oauth -> oauth
            .authorizationEndpoint(a -> a.authorizationRequestResolver(authorizationRequestResolver))
            .userInfoEndpoint(
                userInfo -> userInfo.userService(customOAuth2UserService).oidcUserService(customOidcUserService))
            // 여기: 로그인 성공 후 처리 (refresh 쿠키 + redirect)
            .successHandler((request, response, authentication) -> {
              var oAuth2User = (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
              Long userId = Long.valueOf(oAuth2User.getAttribute("userId").toString());

              UserEntity user = userRepository.findById(userId)
                  .orElseThrow(() -> new IllegalStateException("User not found"));
              if (authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oat) {
                String registrationId = oat.getAuthorizedClientRegistrationId();

                if ("google".equals(registrationId)) {
                  OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(registrationId,
                      oat.getName());

                  if (client != null) {
                    String refresh = (client.getRefreshToken() != null)
                        ? client.getRefreshToken().getTokenValue()
                        : null;

                    String access = (client.getAccessToken() != null)
                        ? client.getAccessToken().getTokenValue()
                        : null;

                    socialAccountRepository.findByUser_IdAndProvider(userId, SocialProvider.GOOGLE)
                        .ifPresent(sa -> {
                          // refresh 있으면 저장 (완성형 핵심)
                          if (refresh != null && !refresh.isBlank()) {
                            sa.setProviderRefreshToken(refresh);
                          }
                          // fallback로 access도 저장(선택)
                          if (access != null && !access.isBlank()) {
                            sa.setProviderAccessToken(access);
                          }
                          socialAccountRepository.save(sa);
                        });
                  }
                }
              }
              String refreshToken = jwtService.createRefreshToken(userId);
              OffsetDateTime expiresAt = OffsetDateTime.ofInstant(jwtService.getExpiresAt(refreshToken),
                  java.time.ZoneOffset.UTC);

              refreshTokenService.store(user, refreshToken, expiresAt);

              // HttpOnly 쿠키로 refresh 심기
              ResponseCookie cookie = ResponseCookie.from(refreshCookieName, refreshToken)
                  .httpOnly(true)
                  .secure(true) // 배포시 _ https이면 true http이면 false
                  .sameSite("None") // 배포시 추가
                  .path("/")
                  .maxAge(60L * 60 * 24 * 14)
                  // 로컬 개발에서 프론트(3000)로 쿠키 보내려면 SameSite 설정이 중요할 수 있음
                  // 스프링 버전에 따라 sameSite 지원이 없을 수 있어. 그땐 헤더로 직접 세팅 필요.
                  .build();

              response.addHeader("Set-Cookie", cookie.toString());
              response.sendRedirect(frontendBaseUrl);
            }));

    // Bearer access 토큰 필터
    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    // Railway 환경에서 paperdot.frontend.base-url 주입이 누락되면 CORS가 깨질 수 있어,
    // 운영에서 쓰는 Vercel 도메인을 함께 허용합니다.
    config.setAllowedOrigins(List.of(
        frontendBaseUrl,
        "https://scholardot.vercel.app"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true); // 쿠키 포함 허용
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
