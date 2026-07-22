package itjobhub.repository;

import itjobhub.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    List<ServicePackage> findAllByOrderByPriceAsc();
    List<ServicePackage> findByStatus(ServicePackage.PackageStatus status);
}
