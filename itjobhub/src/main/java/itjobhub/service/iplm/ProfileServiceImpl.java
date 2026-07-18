package itjobhub.service.iplm;

import itjobhub.dto.profile.*;
import itjobhub.entity.AuthProvider;
import itjobhub.entity.Candidate;
import itjobhub.entity.Company;
import itjobhub.entity.Role;
import itjobhub.entity.User;
import itjobhub.exception.AuthException;
import itjobhub.repository.CandidateRepository;
import itjobhub.repository.CompanyRepository;
import itjobhub.repository.UserRepository;
import itjobhub.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Khong tim thay nguoi dung.", HttpStatus.NOT_FOUND));

        CandidateProfileResponse candidateRes = null;
        CompanyProfileResponse companyRes = null;

        if (user.getRole() == Role.CANDIDATE) {
            Candidate candidate = candidateRepository.findByCandidateId(userId).orElse(null);
            if (candidate != null) {
                candidateRes = CandidateProfileResponse.builder()
                        .candidateId(candidate.getCandidateId())
                        .fullName(candidate.getFullName())
                        .avatarUrl(candidate.getAvatarUrl())
                        .bio(candidate.getBio())
                        .skills(candidate.getSkills())
                        .experience(candidate.getExperience())
                        .education(candidate.getEducation())
                        .preferredLocation(candidate.getPreferredLocation())
                        .build();
            }
        } else if (user.getRole() == Role.EMPLOYER) {
            Company company = companyRepository.findByCompanyId(userId).orElse(null);
            if (company != null) {
                companyRes = CompanyProfileResponse.builder()
                        .companyId(company.getCompanyId())
                        .companyName(company.getCompanyName())
                        .logoUrl(company.getLogoUrl())
                        .location(company.getLocation())
                        .profileStatus(company.getProfileStatus() != null ? company.getProfileStatus().name() : null)
                        .industry(company.getIndustry())
                        .size(company.getSize())
                        .description(company.getDescription())
                        .build();
            }
        }

        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : null)
                .authProvider(user.getAuthProvider() != null ? user.getAuthProvider().name() : null)
                .candidateProfile(candidateRes)
                .companyProfile(companyRes)
                .build();
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Khong tim thay nguoi dung.", HttpStatus.NOT_FOUND));

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);

        if (user.getRole() == Role.CANDIDATE) {
            Candidate candidate = candidateRepository.findByCandidateId(userId).orElse(null);
            if (candidate == null) {
                candidate = Candidate.builder()
                        .candidateId(userId)
                        .user(user)
                        .fullName(request.getFullName() != null ? request.getFullName() : "Candidate " + userId)
                        .build();
            }
            if (request.getFullName() != null) candidate.setFullName(request.getFullName());
            if (request.getAvatarUrl() != null) candidate.setAvatarUrl(request.getAvatarUrl());
            if (request.getBio() != null) candidate.setBio(request.getBio());
            if (request.getSkills() != null) candidate.setSkills(request.getSkills());
            if (request.getExperience() != null) candidate.setExperience(request.getExperience());
            if (request.getEducation() != null) candidate.setEducation(request.getEducation());
            if (request.getPreferredLocation() != null) candidate.setPreferredLocation(request.getPreferredLocation());

            candidateRepository.save(candidate);
        } else if (user.getRole() == Role.EMPLOYER) {
            Company company = companyRepository.findByCompanyId(userId).orElse(null);
            if (company == null) {
                company = Company.builder()
                        .companyId(userId)
                        .user(user)
                        .companyName(request.getCompanyName() != null ? request.getCompanyName() : "Company " + userId)
                        .profileStatus(Company.ProfileStatus.PENDING)
                        .build();
            }
            if (request.getCompanyName() != null) company.setCompanyName(request.getCompanyName());
            if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
            if (request.getLocation() != null) company.setLocation(request.getLocation());
            if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
            if (request.getSize() != null) company.setSize(request.getSize());
            if (request.getDescription() != null) company.setDescription(request.getDescription());

            companyRepository.save(company);
        }

        return getProfile(userId);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Khong tim thay nguoi dung.", HttpStatus.NOT_FOUND));

        if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPassword() == null) {
            throw new AuthException("Tai khoan dang nhap bang Google khong the doi mat khau bang phuong thuc nay.",
                    HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AuthException("Mat khau hien tai khong dung.", HttpStatus.BAD_REQUEST);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AuthException("Mat khau moi khong duoc trung voi mat khau hien tai.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
