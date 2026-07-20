package itjobhub.service.iplm;

import itjobhub.dto.job.JobRequest;
import itjobhub.dto.job.JobResponse;
import itjobhub.entity.*;
import itjobhub.exception.AuthException;
import itjobhub.repository.CompanyRepository;
import itjobhub.repository.JobRepository;
import itjobhub.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;

    // ==================== Public endpoints ====================

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
                String formattedType = jobType.trim().toUpperCase().replace("-", "_");
                typeEnum = JobType.valueOf(formattedType);
            } catch (IllegalArgumentException e) {
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

    // ==================== Employer CRUD ====================

    @Override
    @Transactional
    public JobResponse createJob(Long employerId, JobRequest request) {
        Company company = companyRepository.findByCompanyId(employerId)
                .orElseThrow(() -> new AuthException("Bạn chưa có hồ sơ công ty. Vui lòng cập nhật hồ sơ trước.", HttpStatus.BAD_REQUEST));

        JobStatus status = parseStatus(request.getStatus(), JobStatus.DRAFT);
        JobType jobType = parseJobType(request.getJobType());

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .salaryNegotiable(request.getSalaryNegotiable() != null ? request.getSalaryNegotiable() : false)
                .status(status)
                .location(request.getLocation())
                .jobType(jobType)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isUrgent(request.getIsUrgent() != null ? request.getIsUrgent() : false)
                .expiryDate(parseDate(request.getExpiryDate()))
                .build();

        if (status == JobStatus.PUBLISHED) {
            job.setPostedDate(LocalDateTime.now());
        }

        return JobResponse.fromEntity(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long employerId, Long jobId, JobRequest request) {
        Job job = getJobOwnedBy(employerId, jobId);

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getCurrency() != null) job.setCurrency(request.getCurrency());
        if (request.getSalaryNegotiable() != null) job.setSalaryNegotiable(request.getSalaryNegotiable());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getJobType() != null) job.setJobType(parseJobType(request.getJobType()));
        if (request.getIsFeatured() != null) job.setIsFeatured(request.getIsFeatured());
        if (request.getIsUrgent() != null) job.setIsUrgent(request.getIsUrgent());
        if (request.getExpiryDate() != null) job.setExpiryDate(parseDate(request.getExpiryDate()));
        if (request.getStatus() != null) {
            JobStatus newStatus = parseStatus(request.getStatus(), job.getStatus());
            if (newStatus == JobStatus.PUBLISHED && job.getPostedDate() == null) {
                job.setPostedDate(LocalDateTime.now());
            }
            job.setStatus(newStatus);
        }

        return JobResponse.fromEntity(jobRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(Long employerId, Long jobId) {
        Job job = getJobOwnedBy(employerId, jobId);
        jobRepository.delete(job);
    }

    @Override
    @Transactional
    public JobResponse changeJobStatus(Long employerId, Long jobId, String status) {
        Job job = getJobOwnedBy(employerId, jobId);
        JobStatus newStatus = parseStatus(status, job.getStatus());
        if (newStatus == JobStatus.PUBLISHED && job.getPostedDate() == null) {
            job.setPostedDate(LocalDateTime.now());
        }
        job.setStatus(newStatus);
        return JobResponse.fromEntity(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs(Long employerId) {
        return jobRepository.findByCompanyId(employerId).stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== Helpers ====================

    private Job getJobOwnedBy(Long employerId, Long jobId) {
        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new AuthException("Không tìm thấy tin tuyển dụng.", HttpStatus.NOT_FOUND));
        if (!job.getCompany().getCompanyId().equals(employerId)) {
            throw new AuthException("Bạn không có quyền chỉnh sửa tin tuyển dụng này.", HttpStatus.FORBIDDEN);
        }
        return job;
    }

    private JobStatus parseStatus(String s, JobStatus fallback) {
        if (s == null) return fallback;
        try {
            return JobStatus.valueOf(s.toUpperCase());
        } catch (IllegalArgumentException e) {
            return fallback;
        }
    }

    private JobType parseJobType(String s) {
        if (s == null) return JobType.FULL_TIME;
        try {
            return JobType.valueOf(s.toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return JobType.FULL_TIME;
        }
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr).atTime(23, 59, 59);
        } catch (Exception e) {
            return null;
        }
    }
}
