package itjobhub.controller;

import itjobhub.dto.job.JobRequest;
import itjobhub.dto.job.JobResponse;
import itjobhub.security.UserPrincipal;
import itjobhub.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // ==================== Public endpoints ====================

    @GetMapping
    public ResponseEntity<List<JobResponse>> getPublishedJobs() {
        return ResponseEntity.ok(jobService.getPublishedJobs());
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType
    ) {
        return ResponseEntity.ok(jobService.searchJobs(query, location, jobType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobDetails(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobDetails(id));
    }

    // ==================== Employer endpoints (require JWT) ====================

    @GetMapping("/my")
    public ResponseEntity<List<JobResponse>> getMyJobs(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(jobService.getMyJobs(principal.getUserId()));
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody JobRequest request
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        JobResponse resp = jobService.createJob(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody JobRequest request
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(jobService.updateJob(principal.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        jobService.deleteJob(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponse> changeStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String status = body.get("status");
        return ResponseEntity.ok(jobService.changeJobStatus(principal.getUserId(), id, status));
    }
}
