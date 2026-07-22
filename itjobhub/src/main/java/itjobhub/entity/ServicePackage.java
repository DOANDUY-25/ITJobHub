package itjobhub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "service_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Long packageId;

    @Column(name = "package_name", nullable = false, length = 150)
    private String packageName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    // Stored as JSON array in DB: ["Feature 1", "Feature 2"]
    @Column(columnDefinition = "json")
    private String features;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private PackageStatus status = PackageStatus.ACTIVE;

    public enum PackageStatus { ACTIVE, INACTIVE }
}
