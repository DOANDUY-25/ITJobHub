package itjobhub.repository;

import itjobhub.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT SUM(t.amount) FROM PaymentTransaction t WHERE t.status = 'SUCCESS'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(t.amount) FROM PaymentTransaction t WHERE t.status = 'SUCCESS' " +
           "AND t.createdAt >= :start AND t.createdAt < :end")
    BigDecimal getRevenueInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(t) FROM PaymentTransaction t WHERE t.status = 'SUCCESS' " +
           "AND t.createdAt >= :start AND t.createdAt < :end")
    Long countSuccessfulInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
