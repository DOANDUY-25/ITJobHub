package itjobhub.repository;


import itjobhub.entity.AccountStatus;
import itjobhub.entity.Role;
import itjobhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Admin queries
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByRole(Role role);
    List<User> findByAccountStatus(AccountStatus accountStatus);
    List<User> findByRoleAndAccountStatus(Role role, AccountStatus accountStatus);
    long countByRole(Role role);
    long countByAccountStatus(AccountStatus accountStatus);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :start AND u.createdAt < :end")
    long countNewUsersInPeriod(LocalDateTime start, LocalDateTime end);
}

