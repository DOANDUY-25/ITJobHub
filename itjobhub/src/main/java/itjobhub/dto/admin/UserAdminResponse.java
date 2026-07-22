package itjobhub.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminResponse {
    private Long userId;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private String authProvider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Extra: if CANDIDATE
    private String fullName;
    // Extra: if EMPLOYER
    private String companyName;
    private String companyProfileStatus;
}
