package com.eventhub.bookingservice.controller;

import com.eventhub.bookingservice.model.Payment;
import com.eventhub.bookingservice.service.BookingService;
import com.eventhub.bookingservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingService bookingService;

    // GET /payments - Get all payments (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllPayments(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view all payments");
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // GET /payments/{id} - Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id,
                                            @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view payments");
        }
        Optional<Payment> payment = paymentService.getPaymentById(id);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /payments/booking/{bookingId} - Get payment by booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(@PathVariable Long bookingId,
                                                   @RequestHeader("X-User-Id") Long userId,
                                                   @RequestHeader("X-User-Role") String role) {
        Optional<Payment> payment = paymentService.getPaymentByBookingId(bookingId);
        if (payment.isPresent()) {
            // Users can only view payments for their own bookings, admins can view all
            if (!"ADMIN".equals(role)) {
                // Check if the booking belongs to the user
                Optional<com.eventhub.bookingservice.model.Booking> booking =
                        bookingService.getBookingById(bookingId);
                if (booking.isPresent() && !booking.get().getUserId().equals(userId)) {
                    return ResponseEntity.status(403).body("You can only view payments for your own bookings");
                }
            }
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /payments/transaction/{transactionId} - Get payment by transaction ID (Admin only)
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getPaymentByTransactionId(@PathVariable String transactionId,
                                                       @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view payments");
        }
        Optional<Payment> payment = paymentService.getPaymentByTransactionId(transactionId);
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /payments/status/{status} - Get payments by status (Admin only)
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getPaymentsByStatus(@PathVariable Payment.PaymentStatus status,
                                                 @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view payments");
        }
        List<Payment> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }

    // POST /payments - Create payment (Admin only - for manual payments)
    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest request,
                                           @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can create payments");
        }
        try {
            Payment payment = new Payment();
            payment.setBookingId(request.getBookingId());
            payment.setAmount(request.getAmount());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setTransactionId(request.getTransactionId());
            payment.setPaymentGateway(request.getPaymentGateway());
            payment.setPaymentDetails(request.getPaymentDetails());
            payment.setStatus(request.getStatus());

            Payment savedPayment = paymentService.createPayment(payment);
            return ResponseEntity.ok(savedPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create payment: " + e.getMessage());
        }
    }

    // PUT /payments/{id}/status - Update payment status (Admin only)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id,
                                                 @RequestParam Payment.PaymentStatus status,
                                                 @RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can update payments");
        }
        try {
            Payment payment = paymentService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Payment Service is running");
    }

    // Request DTO for creating payment
    public static class CreatePaymentRequest {
        private Long bookingId;
        private java.math.BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        private String transactionId;
        private String paymentGateway;
        private String paymentDetails;
        private Payment.PaymentStatus status = Payment.PaymentStatus.PENDING;

        // Getters and setters
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public java.math.BigDecimal getAmount() { return amount; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
        public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public String getPaymentGateway() { return paymentGateway; }
        public void setPaymentGateway(String paymentGateway) { this.paymentGateway = paymentGateway; }
        public String getPaymentDetails() { return paymentDetails; }
        public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
        public Payment.PaymentStatus getStatus() { return status; }
        public void setStatus(Payment.PaymentStatus status) { this.status = status; }
    }
}