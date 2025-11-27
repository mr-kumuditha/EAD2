package com.eventhub.bookingservice.repository;

import com.eventhub.bookingservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    Optional<Payment> findByTransactionId(String transactionId);

    // Find payments by user ID through booking join
    @Query("SELECT p FROM Payment p JOIN Booking b ON p.bookingId = b.id WHERE b.userId = :userId")
    List<Payment> findByUserId(@Param("userId") Long userId);

    // Find payments by user ID and status
    @Query("SELECT p FROM Payment p JOIN Booking b ON p.bookingId = b.id WHERE b.userId = :userId AND p.status = :status")
    List<Payment> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Payment.PaymentStatus status);
}