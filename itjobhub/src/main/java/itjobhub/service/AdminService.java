package itjobhub.service;

import itjobhub.dto.admin.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface AdminService {

    // ==================== UC_21 – User Management ====================
    List<UserAdminResponse> getAllUsers(String role, String status);
    UserAdminResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
    UserAdminResponse adminResetPassword(Long userId, AdminResetPasswordRequest request);
    void deleteUser(Long userId);

    // ==================== UC_20 – Content Moderation ====================
    List<JobAdminResponse> getAllJobs(String status);
    JobAdminResponse reviewJob(Long jobId, ReviewJobRequest request);
    List<CompanyAdminResponse> getAllCompanies(String status);
    CompanyAdminResponse reviewCompany(Long companyId, ReviewCompanyRequest request);

    // ==================== UC_22 – Dashboard ====================
    DashboardStatsResponse getDashboardStats();

    // ==================== UC_19 – System Config ====================
    List<ServicePackageResponse> getAllPackages();
    ServicePackageResponse createPackage(ServicePackageRequest request);
    ServicePackageResponse updatePackage(Long packageId, ServicePackageRequest request);
    void deletePackage(Long packageId);
    List<SystemConfigResponse> getAllConfigs();
    SystemConfigResponse upsertConfig(String configName, SystemConfigRequest request);

    // ==================== UC_23 – Reports ====================
    void exportUsersReport(HttpServletResponse response) throws Exception;
    void exportJobsReport(HttpServletResponse response) throws Exception;
    void exportRevenueReport(HttpServletResponse response) throws Exception;
}
