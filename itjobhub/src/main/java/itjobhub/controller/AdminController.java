package itjobhub.controller;

import itjobhub.dto.admin.*;
import itjobhub.service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Controller – tất cả endpoints yêu cầu role ADMIN
 * Prefix: /v1/admin
 *
 * UC_19 – Cấu hình & Quản lý hệ thống
 * UC_20 – Kiểm duyệt nội dung
 * UC_21 – Quản lý & Phân quyền người dùng
 * UC_22 – Thống kê & Doanh thu (Dashboard)
 * UC_23 – Lập và trích xuất báo cáo
 */
@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ==================== UC_21 – User Management ====================

    /**
     * GET /v1/admin/users?role=CANDIDATE&status=ACTIVE
     * Lấy danh sách tất cả người dùng, có thể lọc theo role và status
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(role, status));
    }

    /**
     * PATCH /v1/admin/users/{id}/status
     * Khóa / Mở khóa / Xóa tài khoản người dùng
     */
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserAdminResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request));
    }

    /**
     * PUT /v1/admin/users/{id}/password
     * Reset mật khẩu người dùng
     */
    @PutMapping("/users/{id}/password")
    public ResponseEntity<UserAdminResponse> adminResetPassword(
            @PathVariable Long id,
            @RequestBody AdminResetPasswordRequest request
    ) {
        return ResponseEntity.ok(adminService.adminResetPassword(id, request));
    }

    /**
     * DELETE /v1/admin/users/{id}
     * Đánh dấu xóa tài khoản (soft delete: status = DELETED)
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== UC_20 – Content Moderation ====================

    /**
     * GET /v1/admin/jobs?status=PENDING
     * Lấy danh sách tất cả tin tuyển dụng (filter theo status)
     */
    @GetMapping("/jobs")
    public ResponseEntity<List<JobAdminResponse>> getAllJobs(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminService.getAllJobs(status));
    }

    /**
     * PATCH /v1/admin/jobs/{id}/review
     * Duyệt / Từ chối / Ẩn tin tuyển dụng
     */
    @PatchMapping("/jobs/{id}/review")
    public ResponseEntity<JobAdminResponse> reviewJob(
            @PathVariable Long id,
            @RequestBody ReviewJobRequest request
    ) {
        return ResponseEntity.ok(adminService.reviewJob(id, request));
    }

    /**
     * GET /v1/admin/companies?status=PENDING
     * Lấy danh sách tất cả công ty (filter theo profile_status)
     */
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyAdminResponse>> getAllCompanies(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminService.getAllCompanies(status));
    }

    /**
     * PATCH /v1/admin/companies/{id}/review
     * Duyệt / Từ chối / Ẩn hồ sơ công ty
     */
    @PatchMapping("/companies/{id}/review")
    public ResponseEntity<CompanyAdminResponse> reviewCompany(
            @PathVariable Long id,
            @RequestBody ReviewCompanyRequest request
    ) {
        return ResponseEntity.ok(adminService.reviewCompany(id, request));
    }

    // ==================== UC_22 – Dashboard & Statistics ====================

    /**
     * GET /v1/admin/dashboard/stats
     * Lấy toàn bộ số liệu tổng quan + xu hướng 12 tháng
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== UC_19 – System Configuration ====================

    /**
     * GET /v1/admin/packages
     * Lấy danh sách gói dịch vụ
     */
    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackageResponse>> getAllPackages() {
        return ResponseEntity.ok(adminService.getAllPackages());
    }

    /**
     * POST /v1/admin/packages
     * Tạo gói dịch vụ mới
     */
    @PostMapping("/packages")
    public ResponseEntity<ServicePackageResponse> createPackage(@RequestBody ServicePackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createPackage(request));
    }

    /**
     * PUT /v1/admin/packages/{id}
     * Cập nhật gói dịch vụ
     */
    @PutMapping("/packages/{id}")
    public ResponseEntity<ServicePackageResponse> updatePackage(
            @PathVariable Long id,
            @RequestBody ServicePackageRequest request
    ) {
        return ResponseEntity.ok(adminService.updatePackage(id, request));
    }

    /**
     * DELETE /v1/admin/packages/{id}
     * Vô hiệu hóa gói dịch vụ (soft delete: status = INACTIVE)
     */
    @DeleteMapping("/packages/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        adminService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /v1/admin/config
     * Lấy toàn bộ cấu hình hệ thống
     */
    @GetMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> getAllConfigs() {
        return ResponseEntity.ok(adminService.getAllConfigs());
    }

    /**
     * PUT /v1/admin/config/{configName}
     * Tạo hoặc cập nhật một mục cấu hình
     */
    @PutMapping("/config/{configName}")
    public ResponseEntity<SystemConfigResponse> upsertConfig(
            @PathVariable String configName,
            @RequestBody SystemConfigRequest request
    ) {
        return ResponseEntity.ok(adminService.upsertConfig(configName, request));
    }

    // ==================== UC_23 – Report Export ====================

    /**
     * GET /v1/admin/reports/users
     * Xuất báo cáo danh sách người dùng (Excel)
     */
    @GetMapping("/reports/users")
    public void exportUsersReport(HttpServletResponse response) throws Exception {
        adminService.exportUsersReport(response);
    }

    /**
     * GET /v1/admin/reports/jobs
     * Xuất báo cáo danh sách việc làm (Excel)
     */
    @GetMapping("/reports/jobs")
    public void exportJobsReport(HttpServletResponse response) throws Exception {
        adminService.exportJobsReport(response);
    }

    /**
     * GET /v1/admin/reports/revenue
     * Xuất báo cáo doanh thu 12 tháng (Excel)
     */
    @GetMapping("/reports/revenue")
    public void exportRevenueReport(HttpServletResponse response) throws Exception {
        adminService.exportRevenueReport(response);
    }
}
