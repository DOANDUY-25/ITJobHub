package itjobhub.dto.admin;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackageRequest {
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private String features; // JSON string: ["Feature 1", "Feature 2"]
    private String status;   // ACTIVE or INACTIVE
}
