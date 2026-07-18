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
public class CandidateProfileRequest {
    private String phone;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String skills;
    private String experience;
    private String education;
    private String preferredLocation;
}
