package itjobhub.service.iplm;

import itjobhub.entity.User;
import itjobhub.exception.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALID_MINUTES = 5;   // "qua 5 phut" - theo tai lieu
    private static final int RESEND_COOLDOWN_SECONDS = 60; // "60 giay" - theo tai lieu
    private static final int MAX_RESEND_PER_DAY = 3;  // "3 lan/ngay" - theo tai lieu

    private final EmailService emailService;

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // 6 chu so
        return String.valueOf(code);
    }

    /** Tao OTP moi, gan vao user va gui email. Dung cho dang ky lan dau. */
    public void generateAndSendOtp(User user) {
        String otp = generateOtpCode();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES));
        user.setOtpLastSentAt(LocalDateTime.now());
        user.setOtpResendCount(0);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    /** Gui lai OTP - co kiem tra cooldown 60s va gioi han 3 lan/ngay. */
    public void resendOtp(User user) {
        LocalDateTime now = LocalDateTime.now();

        if (user.getOtpLastSentAt() != null) {
            long secondsSinceLast = ChronoUnit.SECONDS.between(user.getOtpLastSentAt(), now);
            if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
                throw new AuthException(
                        "Vui long doi " + (RESEND_COOLDOWN_SECONDS - secondsSinceLast) + " giay truoc khi gui lai ma.",
                        HttpStatus.TOO_MANY_REQUESTS);
            }
            // Reset dem so lan neu da sang ngay moi
            if (!user.getOtpLastSentAt().toLocalDate().isEqual(now.toLocalDate())) {
                user.setOtpResendCount(0);
            }
        }

        int resendCount = user.getOtpResendCount() == null ? 0 : user.getOtpResendCount();
        if (resendCount >= MAX_RESEND_PER_DAY) {
            throw new AuthException(
                    "Ban da vuot qua so lan gui lai ma toi da trong ngay. Vui long thu lai vao ngay mai.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        String otp = generateOtpCode();
        user.setOtpCode(otp);
        user.setOtpExpiry(now.plusMinutes(OTP_VALID_MINUTES));
        user.setOtpLastSentAt(now);
        user.setOtpResendCount(resendCount + 1);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    /** Kiem tra ma OTP nguoi dung nhap co dung va con hieu luc khong. */
    public void verifyOtp(User user, String otpCode) {
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new AuthException("Ma xac thuc khong dung.", HttpStatus.BAD_REQUEST);
        }
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("Ma xac thuc da het han. Vui long nhan 'Gui lai ma'.", HttpStatus.BAD_REQUEST);
        }
        // Vo hieu hoa OTP sau khi da dung 1 lan
        user.setOtpCode(null);
        user.setOtpExpiry(null);
    }
}