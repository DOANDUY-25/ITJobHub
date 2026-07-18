package itjobhub.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 6, message = "Ma OTP gom 6 chu so")
    private String otpCode;
}
