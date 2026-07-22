package itjobhub.dto.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewJobRequest {
    private String status;  // PUBLISHED, REJECTED, HIDDEN
    private String reason;  // Optional reason for rejection
}
