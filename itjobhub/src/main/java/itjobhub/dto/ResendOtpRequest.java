package itjobhub.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResendOtpRequest {
    @NotBlank @Email
    private String email;
}
