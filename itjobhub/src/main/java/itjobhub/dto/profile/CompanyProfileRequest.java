package itjobhub.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfileRequest {
    private String phone;
    private String companyName;
    private String logoUrl;
    private String location;
    private String industry;
    private String size;
    private String description;
}
