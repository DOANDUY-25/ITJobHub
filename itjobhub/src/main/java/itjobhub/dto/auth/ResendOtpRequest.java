package itjobhub.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResendOtpRequest {
    @NotBlank @Email
    private String email;
}
