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
    private String bannerUrl;
    private String location;
    private String address;
    private String phone;
    private String website;
    private String taxCode;
    private String profileStatus;
    private String industry;
    private String size;
    private String description;
    private String culture;
}
