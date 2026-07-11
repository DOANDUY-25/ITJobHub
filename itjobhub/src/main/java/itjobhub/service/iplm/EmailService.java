package itjobhub.service.iplm;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
