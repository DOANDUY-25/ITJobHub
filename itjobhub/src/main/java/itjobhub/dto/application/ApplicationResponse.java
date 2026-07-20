package itjobhub.dto.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String appliedDate;
    private String status;
    private String coverLetter;
    private String cvUrl;
    private String rejectReason;
}
