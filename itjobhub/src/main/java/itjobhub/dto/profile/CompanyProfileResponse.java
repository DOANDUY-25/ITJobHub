package itjobhub.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyProfileResponse {
    private Long companyId;
    private String companyName;
    private String logoUrl;
    private String location;
    private String profileStatus;
    private String industry;
    private String size;
    private String description;
}
