package itjobhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Long jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Builder.Default
    @Column(nullable = false, length = 3)
    private String currency = "VND";

    @Builder.Default
    @Column(name = "salary_negotiable", nullable = false)
    private Boolean salaryNegotiable = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private JobStatus status = JobStatus.DRAFT;

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;

    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Builder.Default
    @Column(name = "is_urgent", nullable = false)
    private Boolean isUrgent = false;

    @Column(name = "posted_date")
    private LocalDateTime postedDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "VND";
        if (this.salaryNegotiable == null) this.salaryNegotiable = false;
        if (this.status == null) this.status = JobStatus.DRAFT;
        if (this.isFeatured == null) this.isFeatured = false;
        if (this.isUrgent == null) this.isUrgent = false;
        if (this.status == JobStatus.PUBLISHED && this.postedDate == null) {
            this.postedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.status == JobStatus.PUBLISHED && this.postedDate == null) {
            this.postedDate = LocalDateTime.now();
        }
    }
}
