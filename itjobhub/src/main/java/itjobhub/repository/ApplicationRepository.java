package itjobhub.repository;

import itjobhub.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByJobJobIdAndUserUserId(Long jobId, Long userId);
    List<Application> findAllByUserUserIdOrderByAppliedDateDesc(Long userId);
    List<Application> findAllByJobCompanyCompanyIdOrderByAppliedDateDesc(Long companyId);

    // Admin queries
    List<Application> findAllByOrderByAppliedDateDesc();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.appliedDate >= :start AND a.appliedDate < :end")
    long countInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByStatus(Application.ApplicationStatus status);
}

