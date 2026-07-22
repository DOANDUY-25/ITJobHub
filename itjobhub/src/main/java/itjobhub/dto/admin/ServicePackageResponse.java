package itjobhub.dto.admin;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackageResponse {
    private Long packageId;
    private String packageName;
    private BigDecimal price;
    private Integer durationDays;
    private String features; // raw JSON string
    private String status;
}
