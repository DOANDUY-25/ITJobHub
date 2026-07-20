package itjobhub.controller;

import itjobhub.dto.job.JobResponse;
import itjobhub.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

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
}
