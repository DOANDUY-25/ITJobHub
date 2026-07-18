package itjobhub.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    // ID Token (JWT) do Google Sign-In tra ve o phia Frontend (React)
    @NotBlank
    private String idToken;
}
