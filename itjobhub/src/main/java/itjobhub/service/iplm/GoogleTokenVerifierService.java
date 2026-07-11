package itjobhub.service.iplm;

import itjobhub.exception.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    private final WebClient.Builder webClientBuilder;

    public record GoogleUserInfo(String email, String name, String googleUserId) {}

    public GoogleUserInfo verify(String idToken) {
        WebClient client = webClientBuilder.baseUrl("https://oauth2.googleapis.com").build();

        Map<String, Object> payload;
        try {
            payload = client.get()
                    .uri(uriBuilder -> uriBuilder.path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorResume(e -> Mono.error(
                            new AuthException("Google ID Token khong hop le.", HttpStatus.UNAUTHORIZED)))
                    .block();
        } catch (Exception e) {
            throw new AuthException("Khong the xac thuc voi Google.", HttpStatus.UNAUTHORIZED);
        }

        if (payload == null || !googleClientId.equals(payload.get("aud"))) {
            throw new AuthException("Google ID Token khong khop voi ung dung.", HttpStatus.UNAUTHORIZED);
        }

        return new GoogleUserInfo(
                (String) payload.get("email"),
                (String) payload.get("name"),
                (String) payload.get("sub")
        );
    }
}
