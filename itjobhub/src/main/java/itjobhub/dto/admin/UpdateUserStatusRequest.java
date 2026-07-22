package itjobhub.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {
    private String accountStatus; // ACTIVE, LOCKED, DELETED
}
