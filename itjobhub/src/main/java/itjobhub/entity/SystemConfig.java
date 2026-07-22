package itjobhub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long configId;

    @Column(name = "config_name", nullable = false, unique = true, length = 150)
    private String configName;

    @Column(name = "config_value", nullable = false, length = 500)
    private String configValue;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
