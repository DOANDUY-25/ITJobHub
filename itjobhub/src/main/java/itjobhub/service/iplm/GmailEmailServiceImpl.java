package itjobhub.service.iplm;

import itjobhub.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import org.springframework.stereotype.Service;

@Slf4j
@Primary
@Service
@RequiredArgsConstructor
public class GmailEmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${mail.from-name}")
    private String fromName;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("[ITJobHub] Ma xac thuc tai khoan cua ban");
            helper.setText(buildOtpHtml(otpCode), true); // true = noi dung dang HTML

            mailSender.send(message);
            log.info("Da gui OTP thanh cong den {}", toEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Gui email OTP that bai den {}: {}", toEmail, e.getMessage());
            // Khong throw loi ra ngoai de tranh lo email that bai lam lo cau hinh SMTP
            // cho nguoi dung cuoi; nhung van nen ghi log/canh bao cho Admin theo doi.
        }
    }

    private String buildOtpHtml(String otpCode) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color: #2563eb;">ITJobHub</h2>
                    <p>Xin chao,</p>
                    <p>Ma xac thuc (OTP) cua ban la:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px;
                                background: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px;">
                        %s
                    </div>
                    <p style="margin-top: 16px;">Ma nay se het han sau <b>5 phut</b>.
                    Vui long khong chia se ma nay cho bat ky ai.</p>
                    <p style="color: #888; font-size: 12px; margin-top: 24px;">
                        Neu ban khong yeu cau ma nay, vui long bo qua email nay.
                    </p>
                </div>
                """.formatted(otpCode);
    }
}