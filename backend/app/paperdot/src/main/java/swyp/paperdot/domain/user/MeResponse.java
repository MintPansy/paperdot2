package swyp.paperdot.domain.user;

import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {

    private Long userId;
    private String email;
    private String nickname;
    private String profileImageUrl;
}
