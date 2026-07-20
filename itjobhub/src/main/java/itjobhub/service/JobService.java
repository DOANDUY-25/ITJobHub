package itjobhub.service;

import itjobhub.dto.job.JobResponse;
import java.util.List;

public interface JobService {
    List<JobResponse> getPublishedJobs();
    List<JobResponse> searchJobs(String query, String location, String jobType);
    JobResponse getJobDetails(Long jobId);
}
