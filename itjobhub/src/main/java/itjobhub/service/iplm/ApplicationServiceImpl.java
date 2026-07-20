package itjobhub.service.iplm;

import itjobhub.dto.application.ApplicationResponse;
import itjobhub.entity.*;
import itjobhub.exception.AuthException;
import itjobhub.repository.*;
import itjobhub.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final CvFileRepository cvFileRepository;
    private final ApplicationRepository applicationRepository;

    private static final String UPLOAD_DIR = "uploads/cvs/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional
    public ApplicationResponse applyJob(Long userId, Long jobId, String coverLetter, MultipartFile cvFile, String fullName, String phone) {
        // 1. Check User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Không tìm thấy người dùng.", HttpStatus.NOT_FOUND));

        if (user.getRole() != Role.CANDIDATE) {
            throw new AuthException("Chỉ ứng viên mới có thể nộp hồ sơ ứng tuyển.", HttpStatus.BAD_REQUEST);
        }

        // 2. Check Job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new AuthException("Không tìm thấy tin tuyển dụng.", HttpStatus.NOT_FOUND));

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new AuthException("Tin tuyển dụng này hiện không nhận hồ sơ.", HttpStatus.BAD_REQUEST);
        }

        // 3. Prevent duplicate applications
        if (applicationRepository.existsByJobJobIdAndUserUserId(jobId, userId)) {
            throw new AuthException("Bạn đã nộp hồ sơ cho công việc này rồi.", HttpStatus.BAD_REQUEST);
        }

        // 4. Update Candidate profile name & phone if provided
        Candidate candidate = candidateRepository.findByCandidateId(userId)
                .orElse(null);

        if (candidate == null) {
            candidate = Candidate.builder()
                    .user(user)
                    .fullName(fullName != null && !fullName.trim().isEmpty() ? fullName : "Ứng viên " + userId)
                    .build();
            candidate = candidateRepository.save(candidate);
        } else if (fullName != null && !fullName.trim().isEmpty()) {
            candidate.setFullName(fullName);
            candidate = candidateRepository.save(candidate);
        }

        if (phone != null && !phone.trim().isEmpty()) {
            user.setPhone(phone);
            userRepository.save(user);
        }

        // 5. Save CV file to disk
        if (cvFile == null || cvFile.isEmpty()) {
            throw new AuthException("Vui lòng tải lên file CV của bạn.", HttpStatus.BAD_REQUEST);
        }

        String originalFilename = cvFile.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Allowed extensions
        if (!extension.equalsIgnoreCase(".pdf") && !extension.equalsIgnoreCase(".docx") && !extension.equalsIgnoreCase(".doc")) {
            throw new AuthException("Định dạng file không hỗ trợ. Chỉ nhận file PDF, DOC, DOCX.", HttpStatus.BAD_REQUEST);
        }

        String uniqueFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            Path destinationPath = Paths.get(UPLOAD_DIR, uniqueFilename);
            Files.copy(cvFile.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new AuthException("Lỗi lưu trữ tệp tin CV. Vui lòng thử lại.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // 6. Create CvFile entity
        // Make previous cv files not default
        List<CvFile> existingCvs = cvFileRepository.findAllByCandidateCandidateIdAndStatusOrderByUploadDateDesc(userId, CvFile.CvStatus.ACTIVE);
        for (CvFile cv : existingCvs) {
            if (cv.getIsDefault()) {
                cv.setIsDefault(false);
                cvFileRepository.save(cv);
            }
        }

        CvFile newCvFile = CvFile.builder()
                .candidate(candidate)
                .fileUrl(uniqueFilename)
                .isDefault(true)
                .status(CvFile.CvStatus.ACTIVE)
                .build();
        newCvFile = cvFileRepository.save(newCvFile);

        // 7. Create Application
        Application application = Application.builder()
                .job(job)
                .cvFile(newCvFile)
                .user(user)
                .coverLetter(coverLetter)
                .status(Application.ApplicationStatus.PENDING)
                .build();
        application = applicationRepository.save(application);

        return mapToResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByCandidate(Long userId) {
        return applicationRepository.findAllByUserUserIdOrderByAppliedDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForEmployer(Long companyId) {
        return applicationRepository.findAllByJobCompanyCompanyIdOrderByAppliedDateDesc(companyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ApplicationResponse mapToResponse(Application app) {
        Candidate candidate = candidateRepository.findByCandidateId(app.getUser().getUserId()).orElse(null);
        String name = candidate != null ? candidate.getFullName() : "Ứng viên";

        return ApplicationResponse.builder()
                .applicationId(app.getApplicationId())
                .jobId(app.getJob().getJobId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompany().getCompanyName())
                .candidateName(name)
                .candidateEmail(app.getUser().getEmail())
                .candidatePhone(app.getUser().getPhone())
                .appliedDate(app.getAppliedDate().format(DATE_FORMATTER))
                .status(app.getStatus().name())
                .coverLetter(app.getCoverLetter())
                .cvUrl("/v1/applications/cv/" + app.getCvFile().getFileUrl())
                .rejectReason(app.getRejectReason())
                .build();
    }
}
