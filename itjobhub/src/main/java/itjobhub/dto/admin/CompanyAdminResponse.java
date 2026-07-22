package itjobhub.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAdminResponse {
    private Long companyId;
    private String companyName;
    private String logoUrl;
    private String location;
    private String industry;
    private String size;
    private String profileStatus;
    private String website;
    private String taxCode;
    private String description;
    private String ownerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
