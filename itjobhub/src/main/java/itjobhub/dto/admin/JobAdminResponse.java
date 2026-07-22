package itjobhub.dto.admin;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAdminResponse {
    private Long jobId;
    private String title;
    private String companyName;
    private String companyId;
    private String location;
    private String jobType;
    private String status;
    private Boolean isFeatured;
    private Boolean isUrgent;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime postedDate;
    private LocalDateTime expiryDate;
    private String description;
}
