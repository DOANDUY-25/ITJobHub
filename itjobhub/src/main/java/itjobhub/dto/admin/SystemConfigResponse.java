package itjobhub.dto.admin;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfigResponse {
    private Long configId;
    private String configName;
    private String configValue;
    private LocalDateTime lastUpdated;
}
