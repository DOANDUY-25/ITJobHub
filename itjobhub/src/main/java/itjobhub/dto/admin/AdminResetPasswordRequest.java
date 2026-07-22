package itjobhub.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminResetPasswordRequest {
    private String newPassword;
}
