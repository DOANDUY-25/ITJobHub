package itjobhub.service.iplm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockEmailServiceImpl implements EmailService {
    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info(">>> [OTP EMAIL] Gui den {}: Ma xac thuc cua ban la {} (het han sau 5 phut)",
                toEmail, otpCode);
    }
}
