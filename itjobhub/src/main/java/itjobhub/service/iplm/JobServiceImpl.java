package itjobhub.service.iplm;

import itjobhub.dto.job.JobResponse;
import itjobhub.entity.Job;
import itjobhub.entity.JobType;
import itjobhub.exception.AuthException;
import itjobhub.repository.JobRepository;
import itjobhub.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getPublishedJobs() {
        return jobRepository.findAllPublished().stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> searchJobs(String query, String location, String jobType) {
        JobType typeEnum = null;
        if (jobType != null && !jobType.isBlank() && !"All Types".equalsIgnoreCase(jobType)) {
            try {
                // Map frontend values like "Full-time" or "FULL_TIME" to enum JobType
                String formattedType = jobType.trim().toUpperCase().replace("-", "_");
                typeEnum = JobType.valueOf(formattedType);
            } catch (IllegalArgumentException e) {
                // If mapping fails (e.g. Contract, Internship - which are not in JobType enum),
                // we treat it as null to ignore or return empty if needed.
                // Since our JobType enum only has FULL_TIME, PART_TIME, REMOTE, FREELANCE,
                // we catch and default to null.
                typeEnum = null;
            }
        }

        return jobRepository.searchJobs(query, location, typeEnum).stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobDetails(Long jobId) {
        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new AuthException("Không tìm thấy tin tuyển dụng với ID: " + jobId, HttpStatus.NOT_FOUND));
        return JobResponse.fromEntity(job);
    }
}
