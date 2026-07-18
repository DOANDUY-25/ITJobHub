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
public class UserProfileResponse {
    private Long userId;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private String authProvider;

    // Có mặt nếu role = CANDIDATE
    private CandidateProfileResponse candidateProfile;
    // Có mặt nếu role = EMPLOYER
    private CompanyProfileResponse companyProfile;
}
