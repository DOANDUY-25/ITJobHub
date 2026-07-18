package itjobhub.controller;

import itjobhub.dto.profile.ChangePasswordRequest;
import itjobhub.security.UserPrincipal;
import itjobhub.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class ChangePasswordController {

    private final ProfileService profileService;

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        profileService.changePassword(principal.getUserId(), request);
        return ResponseEntity.noContent().build();
    }
}
