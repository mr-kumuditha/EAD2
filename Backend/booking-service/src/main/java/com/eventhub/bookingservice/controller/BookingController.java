package com.eventhub.bookingservice.controller;

import com.eventhub.bookingservice.model.Booking;
import com.eventhub.bookingservice.model.Payment;
import com.eventhub.bookingservice.service.BookingService;
import com.eventhub.bookingservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    // GET /bookings - Get all bookings (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view all bookings");
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /bookings/my-bookings - Get user's bookings
    @GetMapping("/my-bookings")
    public List<Booking> getUserBookings(@RequestHeader("X-User-Id") Long userId) {
        return bookingService.getUserBookings(userId);
    }

    // GET /bookings/my-bookings/status/{status} - Get user's bookings by status
    @GetMapping("/my-bookings/status/{status}")
    public List<Booking> getUserBookingsByStatus(@RequestHeader("X-User-Id") Long userId,
                                                 @PathVariable Booking.BookingStatus status) {
        return bookingService.getUserBookingsByStatus(userId, status);
    }

    // GET /bookings/event/{eventId} - Get bookings for an event (Admin only)
    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getEventBookings(@PathVariable Long eventId,
                                              @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view event bookings");
        }
        return ResponseEntity.ok(bookingService.getEventBookings(eventId));
    }

    // GET /bookings/event/{eventId}/status/{status} - Get bookings for an event by status (Admin only)
    @GetMapping("/event/{eventId}/status/{status}")
    public ResponseEntity<?> getEventBookingsByStatus(@PathVariable Long eventId,
                                                      @PathVariable Booking.BookingStatus status,
                                                      @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view event bookings");
        }
        return ResponseEntity.ok(bookingService.getEventBookingsByStatus(eventId, status));
    }

    // GET /bookings/expired - Get expired bookings (Admin only)
    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredBookings(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view expired bookings");
        }
        return ResponseEntity.ok(bookingService.getExpiredBookings());
    }

    // GET /bookings/{id} - Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id,
                                            @RequestHeader("X-User-Id") Long userId,
                                            @RequestHeader("X-User-Role") String role) {
        Optional<Booking> booking = bookingService.getBookingById(id);
        if (booking.isPresent()) {
            // Users can only view their own bookings, admins can view all
            if (!"ADMIN".equals(role) && !booking.get().getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("You can only view your own bookings");
            }
            return ResponseEntity.ok(booking.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /bookings/reference/{reference} - Get booking by reference
    @GetMapping("/reference/{reference}")
    public ResponseEntity<?> getBookingByReference(@PathVariable String reference,
                                                   @RequestHeader("X-User-Id") Long userId,
                                                   @RequestHeader("X-User-Role") String role) {
        Optional<Booking> booking = bookingService.getBookingByReference(reference);
        if (booking.isPresent()) {
            if (!"ADMIN".equals(role) && !booking.get().getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("You can only view your own bookings");
            }
            return ResponseEntity.ok(booking.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST /bookings - Create new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody CreateBookingRequest request,
                                           @RequestHeader("X-User-Id") Long userId) {
        try {
            // Validate request
            if (request.getEventId() == null) {
                return ResponseEntity.badRequest().body("Event ID is required");
            }
            if (request.getTicketId() == null) {
                return ResponseEntity.badRequest().body("Ticket ID is required");
            }
            if (request.getQuantity() == null || request.getQuantity() < 1) {
                return ResponseEntity.badRequest().body("Quantity must be at least 1");
            }

            Booking booking = bookingService.createBooking(
                    userId, request.getEventId(), request.getTicketId(), request.getQuantity());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /bookings/{bookingId}/confirm - Confirm booking with payment
    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId,
                                            @RequestBody ConfirmBookingRequest request,
                                            @RequestHeader("X-User-Id") Long userId) {
        try {
            // Validate request
            if (request.getPaymentMethod() == null) {
                return ResponseEntity.badRequest().body("Payment method is required");
            }
            if (request.getTransactionId() == null || request.getTransactionId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Transaction ID is required");
            }

            Booking booking = bookingService.confirmBooking(
                    bookingId, request.getPaymentMethod(), request.getTransactionId());
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /bookings/{bookingId}/cancel - Cancel booking
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId,
                                           @RequestHeader("X-User-Id") Long userId) {
        try {
            Booking booking = bookingService.cancelBooking(bookingId, userId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /bookings/event/{eventId}/count - Get confirmed bookings count for event
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Long> getConfirmedBookingsCount(@PathVariable Long eventId) {
        Long count = bookingService.getConfirmedBookingsCount(eventId);
        return ResponseEntity.ok(count);
    }

    // POST /bookings/expire-pending - Expire pending bookings (Admin only - for cron job)
    @PostMapping("/expire-pending")
    public ResponseEntity<?> expirePendingBookings(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can expire bookings");
        }
        bookingService.expirePendingBookings();
        return ResponseEntity.ok("Pending bookings expired successfully");
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Booking Service is running");
    }

    // Request DTOs
    public static class CreateBookingRequest {
        private Long eventId;
        private Long ticketId;
        private Integer quantity;

        // Getters and setters
        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }
        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class ConfirmBookingRequest {
        private Payment.PaymentMethod paymentMethod;
        private String transactionId;

        // Getters and setters
        public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }
}