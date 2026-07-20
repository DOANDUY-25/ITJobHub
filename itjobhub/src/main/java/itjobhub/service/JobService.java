package itjobhub.service;

import itjobhub.dto.job.JobRequest;
import itjobhub.dto.job.JobResponse;
import java.util.List;

public interface JobService {
    List<JobResponse> getPublishedJobs();
    List<JobResponse> searchJobs(String query, String location, String jobType);
    JobResponse getJobDetails(Long jobId);

    // Employer CRUD
    JobResponse createJob(Long employerId, JobRequest request);
    JobResponse updateJob(Long employerId, Long jobId, JobRequest request);
    void deleteJob(Long employerId, Long jobId);
    JobResponse changeJobStatus(Long employerId, Long jobId, String status);
    List<JobResponse> getMyJobs(Long employerId);
}
