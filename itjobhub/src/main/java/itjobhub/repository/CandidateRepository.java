package itjobhub.repository;

import itjobhub.entity.Candidate;
import itjobhub.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByCandidateId(Long candidateId);
}


