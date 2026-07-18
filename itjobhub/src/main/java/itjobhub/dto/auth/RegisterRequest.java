package itjobhub.dto.auth;


import itjobhub.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Mat khau phai co it nhat 8 ky tu")
    private String password;

    @NotBlank
    private String fullName;

    @NotNull(message = "Vai tro khong duoc de trong: CANDIDATE hoac EMPLOYER")
    private Role role;
}
