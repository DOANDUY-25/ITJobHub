package itjobhub.entity;

public enum AccountStatus {
    PENDING_VERIFICATION, // Cho xac thuc OTP
    ACTIVE,                // Dang hoat dong
    LOCKED,                // Bi khoa boi Admin
    DELETED                // Da xoa / vo hieu hoa
}
