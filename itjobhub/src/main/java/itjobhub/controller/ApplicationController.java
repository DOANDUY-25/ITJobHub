package itjobhub.controller;

import itjobhub.dto.application.ApplicationResponse;
import itjobhub.security.UserPrincipal;
import itjobhub.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private static final String UPLOAD_DIR = "uploads/cvs/";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponse> applyJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam("cvFile") MultipartFile cvFile,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "phone", required = false) String phone
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ApplicationResponse response = applicationService.applyJob(
                principal.getUserId(), jobId, coverLetter, cvFile, fullName, phone
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ApplicationResponse> response = applicationService.getApplicationsByCandidate(principal.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employer")
    public ResponseEntity<List<ApplicationResponse>> getEmployerApplications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ApplicationResponse> response = applicationService.getApplicationsForEmployer(principal.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cv/{filename:.+}")
    public ResponseEntity<Resource> viewCv(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                String disposition = "attachment"; // Default to download for binary files

                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                    disposition = "inline"; // PDF can be displayed inline in browsers
                } else if (filename.toLowerCase().endsWith(".docx")) {
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                } else if (filename.toLowerCase().endsWith(".doc")) {
                    contentType = "application/msword";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
