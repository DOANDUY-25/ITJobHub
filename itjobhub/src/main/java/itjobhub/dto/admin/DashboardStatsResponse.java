package itjobhub.dto.admin;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    // Totals
    private long totalUsers;
    private long totalCandidates;
    private long totalEmployers;
    private long totalJobs;
    private long totalPublishedJobs;
    private long totalPendingJobs;
    private long totalApplications;
    private long totalCompanies;
    private long totalPendingCompanies;
    private BigDecimal totalRevenue;

    // Monthly trend data (12 months)
    private List<MonthlyStatDto> monthlyStats;
}
