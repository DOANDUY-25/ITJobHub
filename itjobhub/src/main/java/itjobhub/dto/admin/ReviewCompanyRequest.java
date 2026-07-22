package itjobhub.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCompanyRequest {
    private String status;  // APPROVED, REJECTED, HIDDEN
    private String reason;
}
