package itjobhub.repository;

import itjobhub.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyId(Long companyId);
    Optional<Company> findByCompanyName(String companyName);

    // Admin queries
    @Query("SELECT c FROM Company c ORDER BY c.createdAt DESC")
    List<Company> findAllOrderByCreatedAtDesc();

    List<Company> findByProfileStatus(Company.ProfileStatus profileStatus);

    long countByProfileStatus(Company.ProfileStatus profileStatus);
}
