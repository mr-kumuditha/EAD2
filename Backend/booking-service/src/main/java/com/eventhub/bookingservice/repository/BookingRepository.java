package com.eventhub.bookingservice.repository;

import com.eventhub.bookingservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventId(Long eventId);

    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);

    List<Booking> findByEventIdAndStatus(Long eventId, Booking.BookingStatus status);

    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate < :expiryTime AND b.status = 'PENDING'")
    List<Booking> findExpiredBookings(@Param("expiryTime") LocalDateTime expiryTime);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.eventId = :eventId AND b.status = 'CONFIRMED'")
    Long countConfirmedBookingsByEventId(@Param("eventId") Long eventId);

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.eventId = :eventId AND b.status = 'CONFIRMED'")
    List<Booking> findUserConfirmedBookingsForEvent(@Param("userId") Long userId, @Param("eventId") Long eventId);

    boolean existsByUserIdAndTicketIdAndStatus(Long userId, Long ticketId, Booking.BookingStatus status);
}