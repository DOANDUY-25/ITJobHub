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
public class UpdateProfileRequest {
    private String phone;

    // Candidate fields
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String skills;
    private String experience;
    private String education;
    private String preferredLocation;

    // Company fields
    private String companyName;
    private String logoUrl;
    private String bannerUrl;
    private String location;
    private String address;
    private String companyPhone;
    private String website;
    private String taxCode;
    private String industry;
    private String size;
    private String description;
    private String culture;
}
