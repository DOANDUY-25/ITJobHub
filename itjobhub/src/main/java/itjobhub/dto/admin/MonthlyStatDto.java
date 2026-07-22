package itjobhub.dto.admin;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyStatDto {
    private String month;      // e.g. "01/2026"
    private long newUsers;
    private long newJobs;
    private long newApplications;
    private BigDecimal revenue;
}
