package itjobhub.repository;

import itjobhub.entity.CvFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CvFileRepository extends JpaRepository<CvFile, Long> {
    Optional<CvFile> findFirstByCandidateCandidateIdAndIsDefaultTrueAndStatus(Long candidateId, CvFile.CvStatus status);
    List<CvFile> findAllByCandidateCandidateIdAndStatusOrderByUploadDateDesc(Long candidateId, CvFile.CvStatus status);
}
