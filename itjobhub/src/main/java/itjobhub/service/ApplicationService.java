package itjobhub.service;

import itjobhub.dto.application.ApplicationResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ApplicationService {
    ApplicationResponse applyJob(Long userId, Long jobId, String coverLetter, MultipartFile cvFile, String fullName, String phone);
    List<ApplicationResponse> getApplicationsByCandidate(Long userId);
    List<ApplicationResponse> getApplicationsForEmployer(Long companyId);
}
