package itjobhub.dto.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequest {
    private String title;
    private String description;
    private String requirements;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;         // "VND" or "USD"
    private Boolean salaryNegotiable;
    private String status;           // "DRAFT" | "PUBLISHED" | "CLOSED"
    private String location;
    private String jobType;          // "FULL_TIME" | "PART_TIME" | "REMOTE" | "FREELANCE"
    private Boolean isFeatured;
    private Boolean isUrgent;
    private String expiryDate;       // ISO date string "2026-12-31"
}
