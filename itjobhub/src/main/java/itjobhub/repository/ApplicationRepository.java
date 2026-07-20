package itjobhub.repository;

import itjobhub.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByJobJobIdAndUserUserId(Long jobId, Long userId);
    List<Application> findAllByUserUserIdOrderByAppliedDateDesc(Long userId);
    List<Application> findAllByJobCompanyCompanyIdOrderByAppliedDateDesc(Long companyId);
}
