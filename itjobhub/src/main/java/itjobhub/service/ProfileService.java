package itjobhub.service;

import itjobhub.dto.profile.ChangePasswordRequest;
import itjobhub.dto.profile.UpdateProfileRequest;
import itjobhub.dto.profile.UserProfileResponse;

public interface ProfileService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);
}
