package itjobhub.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 6)
    private String otpCode;

    @NotBlank
    @Size(min = 8, message = "Mat khau moi phai co it nhat 8 ky tu")
    private String newPassword;
}
