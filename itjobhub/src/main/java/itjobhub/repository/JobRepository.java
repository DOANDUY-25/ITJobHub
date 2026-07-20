package itjobhub.repository;

import itjobhub.entity.Job;
import itjobhub.entity.JobStatus;
import itjobhub.entity.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j JOIN FETCH j.company c WHERE j.jobId = :jobId")
    Optional<Job> findByIdWithCompany(@Param("jobId") Long jobId);

    @Query("SELECT j FROM Job j JOIN FETCH j.company c " +
           "WHERE j.status = 'PUBLISHED' " +
           "ORDER BY j.isFeatured DESC, j.isUrgent DESC, j.postedDate DESC, j.jobId DESC")
    List<Job> findAllPublished();

    @Query("SELECT j FROM Job j JOIN FETCH j.company c " +
           "WHERE j.status = 'PUBLISHED' " +
           "AND (:query IS NULL OR :query = '' " +
           "    OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(j.requirements) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:location IS NULL OR :location = 'All Locations' OR :location = '' " +
           "    OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "ORDER BY j.isFeatured DESC, j.isUrgent DESC, j.postedDate DESC, j.jobId DESC")
    List<Job> searchJobs(
            @Param("query") String query,
            @Param("location") String location,
            @Param("jobType") JobType jobType
    );

    @Query("SELECT j FROM Job j JOIN FETCH j.company c WHERE c.companyId = :companyId ORDER BY j.createdAt DESC")
    List<Job> findByCompanyId(@Param("companyId") Long companyId);
}
