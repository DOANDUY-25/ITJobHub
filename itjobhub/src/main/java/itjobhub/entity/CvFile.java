package itjobhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cv_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cv_id")
    private Long cvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "parsed_text", columnDefinition = "json")
    private String parsedText;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "upload_date", nullable = false)
    @Builder.Default
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CvStatus status = CvStatus.ACTIVE;

    public enum CvStatus {
        ACTIVE,
        DELETED
    }

    @PrePersist
    void prePersist() {
        if (this.uploadDate == null) {
            this.uploadDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = CvStatus.ACTIVE;
        }
        if (this.isDefault == null) {
            this.isDefault = false;
        }
    }
}
