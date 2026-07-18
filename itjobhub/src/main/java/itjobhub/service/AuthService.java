package itjobhub.service;

import itjobhub.dto.auth.*;
import itjobhub.entity.*;
import itjobhub.exception.AuthException;
import itjobhub.repository.CandidateRepository;
import itjobhub.repository.CompanyRepository;
import itjobhub.repository.UserRepository;
import itjobhub.security.JwtService;
import itjobhub.service.iplm.GoogleTokenVerifierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    // ===== UC_04: Dang ky =====
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email da ton tai. Vui long chon email khac.", HttpStatus.CONFLICT);
        }
        if (request.getRole() == Role.ADMIN) {
            throw new AuthException("Khong the tu dang ky tai khoan Admin.", HttpStatus.FORBIDDEN);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .role(request.getRole())
                .accountStatus(AccountStatus.PENDING_VERIFICATION)
                .build();

        userRepository.save(user);
        otpService.generateAndSendOtp(user);

        return new MessageResponse("Dang ky thanh cong. Vui long kiem tra email de lay ma xac thuc.");
    }

    // ===== UC_04 (luong phu): Xac thuc OTP sau dang ky =====
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Khong tim thay tai khoan.", HttpStatus.NOT_FOUND));

        otpService.verifyOtp(user, request.getOtpCode());
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ===== UC_04 (luong phu): Gui lai ma OTP =====
    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Khong tim thay tai khoan.", HttpStatus.NOT_FOUND));

        if (user.getAccountStatus() != AccountStatus.PENDING_VERIFICATION) {
            throw new AuthException("Tai khoan da duoc xac thuc.", HttpStatus.BAD_REQUEST);
        }

        otpService.resendOtp(user);
        userRepository.save(user);
        return new MessageResponse("Da gui lai ma xac thuc.");
    }

    // ===== UC_05: Dang nhap thuong (Email/Password) =====
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Email hoac mat khau khong dung.", HttpStatus.UNAUTHORIZED));

        if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPassword() == null) {
            throw new AuthException("Tai khoan nay dang nhap bang Google. Vui long dung nut 'Dang nhap voi Google'.",
                    HttpStatus.BAD_REQUEST);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Email hoac mat khau khong dung.", HttpStatus.UNAUTHORIZED);
        }

        checkAccountStatus(user);
        return buildAuthResponse(user);
    }

    // ===== UC_05 (luong thay the): Dang nhap bang Google =====
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenVerifierService.GoogleUserInfo googleUser = googleTokenVerifierService.verify(request.getIdToken());

        User user = userRepository.findByEmail(googleUser.email()).orElse(null);

        if (user == null) {
            // Chua co tai khoan -> tu dong tao moi, xac thuc ngay (theo Hau dieu kien UC_04)
            user = User.builder()
                    .email(googleUser.email())
                    .authProvider(AuthProvider.GOOGLE)
                    .providerId(googleUser.googleUserId())
                    .role(Role.CANDIDATE) // mac dinh CANDIDATE, co the cho chon vai tro o buoc sau
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
            userRepository.save(user);
        } else {
            checkAccountStatus(user);
            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                // Lien ket tai khoan LOCAL da co voi Google (cung email)
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setProviderId(googleUser.googleUserId());
                userRepository.save(user);
            }
        }

        return buildAuthResponse(user);
    }

    // ===== Quen mat khau: gui OTP =====
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Khong tim thay tai khoan voi email nay.", HttpStatus.NOT_FOUND));

        otpService.generateAndSendOtp(user);
        userRepository.save(user);
        return new MessageResponse("Da gui ma OTP khoi phuc mat khau den email.");
    }

    // ===== Dat lai mat khau bang OTP =====
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Khong tim thay tai khoan.", HttpStatus.NOT_FOUND));

        otpService.verifyOtp(user, request.getOtpCode());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Dat lai mat khau thanh cong. Vui long dang nhap lai.");
    }

    // ===== Helper =====
    private void checkAccountStatus(User user) {
        switch (user.getAccountStatus()) {
            case LOCKED ->
                    throw new AuthException("Tai khoan da bi khoa. Vui long lien he Admin.", HttpStatus.FORBIDDEN);
            case DELETED -> throw new AuthException("Tai khoan khong ton tai.", HttpStatus.NOT_FOUND);
            case PENDING_VERIFICATION ->
                    throw new AuthException("Tai khoan chua xac thuc. Vui long nhap ma OTP.", HttpStatus.FORBIDDEN);
            case ACTIVE -> { /* ok */ }
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getUserId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getUserId(), user.getEmail(), user.getRole().name());

        String fullName = null;
        if (user.getRole() == Role.CANDIDATE) {
            Candidate candidate = candidateRepository.findByCandidateId(user.getUserId()).orElse(null);
            if (candidate != null) fullName = candidate.getFullName();
        } else if (user.getRole() == Role.EMPLOYER) {
            Company company = companyRepository.findByCompanyId(user.getUserId()).orElse(null);
            if (company != null) fullName = company.getCompanyName();
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(fullName)
                .role(user.getRole().name())
                .build();
    }
}
