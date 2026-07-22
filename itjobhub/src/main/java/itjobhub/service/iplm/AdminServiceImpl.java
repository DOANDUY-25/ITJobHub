package itjobhub.service.iplm;

import itjobhub.dto.admin.*;
import itjobhub.entity.*;
import itjobhub.exception.AuthException;
import itjobhub.repository.*;
import itjobhub.service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ==================== UC_21 – User Management ====================

    @Override
    @Transactional(readOnly = true)
    public List<UserAdminResponse> getAllUsers(String roleStr, String statusStr) {
        List<User> users;

        Role roleFilter = parseRole(roleStr);
        AccountStatus statusFilter = parseAccountStatus(statusStr);

        if (roleFilter != null && statusFilter != null) {
            users = userRepository.findByRoleAndAccountStatus(roleFilter, statusFilter);
        } else if (roleFilter != null) {
            users = userRepository.findByRole(roleFilter);
        } else if (statusFilter != null) {
            users = userRepository.findByAccountStatus(statusFilter);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }

        return users.stream().map(this::mapUserToAdminResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = getUserOrThrow(userId);
        AccountStatus newStatus = parseAccountStatus(request.getAccountStatus());
        if (newStatus == null) {
            throw new AuthException("Trạng thái không hợp lệ: " + request.getAccountStatus(), HttpStatus.BAD_REQUEST);
        }
        user.setAccountStatus(newStatus);
        userRepository.save(user);
        return mapUserToAdminResponse(user);
    }

    @Override
    @Transactional
    public UserAdminResponse adminResetPassword(Long userId, AdminResetPasswordRequest request) {
        User user = getUserOrThrow(userId);
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new AuthException("Mật khẩu mới phải có ít nhất 6 ký tự.", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return mapUserToAdminResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserOrThrow(userId);
        user.setAccountStatus(AccountStatus.DELETED);
        userRepository.save(user);
    }

    // ==================== UC_20 – Content Moderation ====================

    @Override
    @Transactional(readOnly = true)
    public List<JobAdminResponse> getAllJobs(String statusStr) {
        List<Job> jobs;
        JobStatus statusFilter = parseJobStatus(statusStr);
        if (statusFilter != null) {
            jobs = jobRepository.findAllByStatus(statusFilter);
        } else {
            jobs = jobRepository.findAllWithCompany();
        }
        return jobs.stream().map(this::mapJobToAdminResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobAdminResponse reviewJob(Long jobId, ReviewJobRequest request) {
        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new AuthException("Không tìm thấy tin tuyển dụng.", HttpStatus.NOT_FOUND));

        JobStatus newStatus = parseJobStatus(request.getStatus());
        if (newStatus == null) {
            throw new AuthException("Trạng thái không hợp lệ: " + request.getStatus(), HttpStatus.BAD_REQUEST);
        }

        job.setStatus(newStatus);
        if (newStatus == JobStatus.PUBLISHED && job.getPostedDate() == null) {
            job.setPostedDate(LocalDateTime.now());
        }
        jobRepository.save(job);
        return mapJobToAdminResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyAdminResponse> getAllCompanies(String statusStr) {
        List<Company> companies;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                Company.ProfileStatus ps = Company.ProfileStatus.valueOf(statusStr.toUpperCase());
                companies = companyRepository.findByProfileStatus(ps);
            } catch (IllegalArgumentException e) {
                companies = companyRepository.findAllOrderByCreatedAtDesc();
            }
        } else {
            companies = companyRepository.findAllOrderByCreatedAtDesc();
        }
        return companies.stream().map(this::mapCompanyToAdminResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompanyAdminResponse reviewCompany(Long companyId, ReviewCompanyRequest request) {
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new AuthException("Không tìm thấy công ty.", HttpStatus.NOT_FOUND));

        try {
            Company.ProfileStatus newStatus = Company.ProfileStatus.valueOf(request.getStatus().toUpperCase());
            company.setProfileStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new AuthException("Trạng thái không hợp lệ: " + request.getStatus(), HttpStatus.BAD_REQUEST);
        }

        companyRepository.save(company);
        return mapCompanyToAdminResponse(company);
    }

    // ==================== UC_22 – Dashboard ====================

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCandidates = userRepository.countByRole(Role.CANDIDATE);
        long totalEmployers = userRepository.countByRole(Role.EMPLOYER);
        long totalJobs = jobRepository.count();
        long totalPublishedJobs = jobRepository.countByStatus(JobStatus.PUBLISHED);
        long totalPendingJobs = jobRepository.countByStatus(JobStatus.PENDING);
        long totalApplications = applicationRepository.count();
        long totalCompanies = companyRepository.count();
        long totalPendingCompanies = companyRepository.countByProfileStatus(Company.ProfileStatus.PENDING);

        BigDecimal totalRevenue = paymentTransactionRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        // Monthly stats for last 12 months
        List<MonthlyStatDto> monthlyStats = buildMonthlyStats(12);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalEmployers(totalEmployers)
                .totalJobs(totalJobs)
                .totalPublishedJobs(totalPublishedJobs)
                .totalPendingJobs(totalPendingJobs)
                .totalApplications(totalApplications)
                .totalCompanies(totalCompanies)
                .totalPendingCompanies(totalPendingCompanies)
                .totalRevenue(totalRevenue)
                .monthlyStats(monthlyStats)
                .build();
    }

    // ==================== UC_19 – System Config ====================

    @Override
    @Transactional(readOnly = true)
    public List<ServicePackageResponse> getAllPackages() {
        return servicePackageRepository.findAllByOrderByPriceAsc()
                .stream().map(this::mapPackage).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServicePackageResponse createPackage(ServicePackageRequest request) {
        ServicePackage pkg = ServicePackage.builder()
                .packageName(request.getPackageName())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .features(request.getFeatures())
                .status(parsePackageStatus(request.getStatus()))
                .build();
        return mapPackage(servicePackageRepository.save(pkg));
    }

    @Override
    @Transactional
    public ServicePackageResponse updatePackage(Long packageId, ServicePackageRequest request) {
        ServicePackage pkg = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new AuthException("Không tìm thấy gói dịch vụ.", HttpStatus.NOT_FOUND));
        if (request.getPackageName() != null) pkg.setPackageName(request.getPackageName());
        if (request.getPrice() != null) pkg.setPrice(request.getPrice());
        if (request.getDurationDays() != null) pkg.setDurationDays(request.getDurationDays());
        if (request.getFeatures() != null) pkg.setFeatures(request.getFeatures());
        if (request.getStatus() != null) pkg.setStatus(parsePackageStatus(request.getStatus()));
        return mapPackage(servicePackageRepository.save(pkg));
    }

    @Override
    @Transactional
    public void deletePackage(Long packageId) {
        ServicePackage pkg = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new AuthException("Không tìm thấy gói dịch vụ.", HttpStatus.NOT_FOUND));
        pkg.setStatus(ServicePackage.PackageStatus.INACTIVE);
        servicePackageRepository.save(pkg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigResponse> getAllConfigs() {
        return systemConfigRepository.findAll().stream().map(this::mapConfig).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SystemConfigResponse upsertConfig(String configName, SystemConfigRequest request) {
        SystemConfig config = systemConfigRepository.findByConfigName(configName)
                .orElse(SystemConfig.builder().configName(configName).build());
        config.setConfigValue(request.getConfigValue());
        return mapConfig(systemConfigRepository.save(config));
    }

    // ==================== UC_23 – Reports ====================

    @Override
    public void exportUsersReport(HttpServletResponse response) throws Exception {
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=users_report.xlsx");

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách người dùng");

            // Header
            CellStyle headerStyle = createHeaderStyle(workbook);
            Row header = sheet.createRow(0);
            String[] cols = {"ID", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Ngày đăng ký"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Data rows
            int rowNum = 1;
            for (User u : users) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(u.getUserId());
                row.createCell(1).setCellValue(u.getEmail());
                row.createCell(2).setCellValue(u.getPhone() != null ? u.getPhone() : "");
                row.createCell(3).setCellValue(u.getRole() != null ? u.getRole().name() : "");
                row.createCell(4).setCellValue(u.getAccountStatus() != null ? u.getAccountStatus().name() : "");
                row.createCell(5).setCellValue(u.getCreatedAt() != null ? u.getCreatedAt().format(DT_FMT) : "");
            }
            workbook.write(response.getOutputStream());
        }
    }

    @Override
    public void exportJobsReport(HttpServletResponse response) throws Exception {
        List<Job> jobs = jobRepository.findAllWithCompany();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=jobs_report.xlsx");

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách việc làm");

            CellStyle headerStyle = createHeaderStyle(workbook);
            Row header = sheet.createRow(0);
            String[] cols = {"ID", "Tiêu đề", "Công ty", "Địa điểm", "Loại hình", "Mức lương tối thiểu", "Mức lương tối đa", "Trạng thái", "Nổi bật", "Ngày đăng"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            int rowNum = 1;
            for (Job j : jobs) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(j.getJobId());
                row.createCell(1).setCellValue(j.getTitle());
                row.createCell(2).setCellValue(j.getCompany() != null ? j.getCompany().getCompanyName() : "");
                row.createCell(3).setCellValue(j.getLocation() != null ? j.getLocation() : "");
                row.createCell(4).setCellValue(j.getJobType() != null ? j.getJobType().name() : "");
                row.createCell(5).setCellValue(j.getSalaryMin() != null ? j.getSalaryMin().toPlainString() : "");
                row.createCell(6).setCellValue(j.getSalaryMax() != null ? j.getSalaryMax().toPlainString() : "");
                row.createCell(7).setCellValue(j.getStatus() != null ? j.getStatus().name() : "");
                row.createCell(8).setCellValue(Boolean.TRUE.equals(j.getIsFeatured()) ? "Có" : "Không");
                row.createCell(9).setCellValue(j.getPostedDate() != null ? j.getPostedDate().format(DT_FMT) : "");
            }
            workbook.write(response.getOutputStream());
        }
    }

    @Override
    public void exportRevenueReport(HttpServletResponse response) throws Exception {
        List<MonthlyStatDto> stats = buildMonthlyStats(12);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=revenue_report.xlsx");

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Báo cáo doanh thu");

            CellStyle headerStyle = createHeaderStyle(workbook);
            Row header = sheet.createRow(0);
            String[] cols = {"Tháng", "Người dùng mới", "Job mới", "Hồ sơ nộp", "Doanh thu (VND)"};
            for (int i = 0; i < cols.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5500);
            }

            int rowNum = 1;
            for (MonthlyStatDto m : stats) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(m.getMonth());
                row.createCell(1).setCellValue(m.getNewUsers());
                row.createCell(2).setCellValue(m.getNewJobs());
                row.createCell(3).setCellValue(m.getNewApplications());
                row.createCell(4).setCellValue(m.getRevenue() != null ? m.getRevenue().toPlainString() : "0");
            }
            workbook.write(response.getOutputStream());
        }
    }

    // ==================== Private Helpers ====================

    private List<MonthlyStatDto> buildMonthlyStats(int months) {
        List<MonthlyStatDto> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusMonths(1);
            String monthLabel = start.format(MONTH_FMT);

            long newUsers = userRepository.countNewUsersInPeriod(start, end);
            long newJobs = jobRepository.countNewJobsInPeriod(start, end);
            long newApps = applicationRepository.countInPeriod(start, end);
            BigDecimal revenue = paymentTransactionRepository.getRevenueInPeriod(start, end);
            if (revenue == null) revenue = BigDecimal.ZERO;

            result.add(MonthlyStatDto.builder()
                    .month(monthLabel)
                    .newUsers(newUsers)
                    .newJobs(newJobs)
                    .newApplications(newApps)
                    .revenue(revenue)
                    .build());
        }
        return result;
    }

    private UserAdminResponse mapUserToAdminResponse(User u) {
        UserAdminResponse res = UserAdminResponse.builder()
                .userId(u.getUserId())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .accountStatus(u.getAccountStatus() != null ? u.getAccountStatus().name() : null)
                .authProvider(u.getAuthProvider() != null ? u.getAuthProvider().name() : null)
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();

        if (u.getRole() == Role.CANDIDATE) {
            candidateRepository.findByCandidateId(u.getUserId())
                    .ifPresent(c -> res.setFullName(c.getFullName()));
        } else if (u.getRole() == Role.EMPLOYER) {
            companyRepository.findByCompanyId(u.getUserId()).ifPresent(c -> {
                res.setCompanyName(c.getCompanyName());
                res.setCompanyProfileStatus(c.getProfileStatus() != null ? c.getProfileStatus().name() : null);
            });
        }
        return res;
    }

    private JobAdminResponse mapJobToAdminResponse(Job j) {
        return JobAdminResponse.builder()
                .jobId(j.getJobId())
                .title(j.getTitle())
                .companyName(j.getCompany() != null ? j.getCompany().getCompanyName() : null)
                .companyId(j.getCompany() != null ? j.getCompany().getCompanyId().toString() : null)
                .location(j.getLocation())
                .jobType(j.getJobType() != null ? j.getJobType().name() : null)
                .status(j.getStatus() != null ? j.getStatus().name() : null)
                .isFeatured(j.getIsFeatured())
                .isUrgent(j.getIsUrgent())
                .salaryMin(j.getSalaryMin())
                .salaryMax(j.getSalaryMax())
                .currency(j.getCurrency())
                .createdAt(j.getCreatedAt())
                .postedDate(j.getPostedDate())
                .expiryDate(j.getExpiryDate())
                .description(j.getDescription())
                .build();
    }

    private CompanyAdminResponse mapCompanyToAdminResponse(Company c) {
        String ownerEmail = c.getUser() != null ? c.getUser().getEmail() : null;
        return CompanyAdminResponse.builder()
                .companyId(c.getCompanyId())
                .companyName(c.getCompanyName())
                .logoUrl(c.getLogoUrl())
                .location(c.getLocation())
                .industry(c.getIndustry())
                .size(c.getSize())
                .profileStatus(c.getProfileStatus() != null ? c.getProfileStatus().name() : null)
                .website(c.getWebsite())
                .taxCode(c.getTaxCode())
                .description(c.getDescription())
                .ownerEmail(ownerEmail)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private ServicePackageResponse mapPackage(ServicePackage p) {
        return ServicePackageResponse.builder()
                .packageId(p.getPackageId())
                .packageName(p.getPackageName())
                .price(p.getPrice())
                .durationDays(p.getDurationDays())
                .features(p.getFeatures())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .build();
    }

    private SystemConfigResponse mapConfig(SystemConfig c) {
        return SystemConfigResponse.builder()
                .configId(c.getConfigId())
                .configName(c.getConfigName())
                .configValue(c.getConfigValue())
                .lastUpdated(c.getLastUpdated())
                .build();
    }

    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Không tìm thấy người dùng với ID: " + userId, HttpStatus.NOT_FOUND));
    }

    private Role parseRole(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Role.valueOf(s.toUpperCase()); } catch (Exception e) { return null; }
    }

    private AccountStatus parseAccountStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return AccountStatus.valueOf(s.toUpperCase()); } catch (Exception e) { return null; }
    }

    private JobStatus parseJobStatus(String s) {
        if (s == null || s.isBlank()) return null;
        try { return JobStatus.valueOf(s.toUpperCase()); } catch (Exception e) { return null; }
    }

    private ServicePackage.PackageStatus parsePackageStatus(String s) {
        if (s == null || s.isBlank()) return ServicePackage.PackageStatus.ACTIVE;
        try { return ServicePackage.PackageStatus.valueOf(s.toUpperCase()); }
        catch (Exception e) { return ServicePackage.PackageStatus.ACTIVE; }
    }
}
