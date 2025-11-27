package com.eventhub.bookingservice.service;

import com.eventhub.bookingservice.client.EventServiceClient;
import com.eventhub.bookingservice.client.TicketServiceClient;
import com.eventhub.bookingservice.model.Booking;
import com.eventhub.bookingservice.model.Payment;
import com.eventhub.bookingservice.repository.BookingRepository;
import com.eventhub.bookingservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private EventServiceClient eventServiceClient;

    @Autowired
    private TicketServiceClient ticketServiceClient;

    private static final int BOOKING_EXPIRY_MINUTES = 30; // 30 minutes to complete payment

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getUserBookingsByStatus(Long userId, Booking.BookingStatus status) {
        return bookingRepository.findByUserIdAndStatus(userId, status);
    }

    public List<Booking> getEventBookings(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    public List<Booking> getEventBookingsByStatus(Long eventId, Booking.BookingStatus status) {
        return bookingRepository.findByEventIdAndStatus(eventId, status);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public Optional<Booking> getBookingByReference(String bookingReference) {
        return bookingRepository.findByBookingReference(bookingReference);
    }

    @Transactional
    public Booking createBooking(Long userId, Long eventId, Long ticketId, Integer quantity) {
        // Validate event exists and is active
        EventServiceClient.Event event = eventServiceClient.getEventById(eventId);
        if (event == null) {
            throw new RuntimeException("Event not found");
        }
        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("Event is not active for booking");
        }

        // Validate ticket exists and is available
        TicketServiceClient.Ticket ticket = ticketServiceClient.getTicketById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        if (!ticket.getEventId().equals(eventId)) {
            throw new RuntimeException("Ticket does not belong to the specified event");
        }

        // Check ticket availability
        TicketServiceClient.AvailabilityResponse availability = ticketServiceClient.checkAvailability(ticketId,
                quantity);
        if (!availability.isAvailable()) {
            throw new RuntimeException("Not enough tickets available. Only " +
                    availability.getAvailableQuantity() + " tickets left.");
        }

        // Check if user already has booking for this ticket
        if (bookingRepository.existsByUserIdAndTicketIdAndStatus(userId, ticketId, Booking.BookingStatus.CONFIRMED)) {
            throw new RuntimeException("You already have a confirmed booking for this ticket type");
        }

        // Check max per user limit
        List<Booking> userBookings = bookingRepository.findUserConfirmedBookingsForEvent(userId, eventId);
        int totalUserTickets = userBookings.stream().mapToInt(Booking::getQuantity).sum();
        if (totalUserTickets + quantity > ticket.getMaxPerUser()) {
            throw new RuntimeException(
                    "Maximum " + ticket.getMaxPerUser() + " tickets allowed per user for this event");
        }

        // Reserve tickets
        boolean reserved = ticketServiceClient.reserveTickets(ticketId, quantity);
        if (!reserved) {
            throw new RuntimeException("Failed to reserve tickets. Please try again.");
        }

        try {
            // Calculate total price
            BigDecimal totalPrice = ticket.getPrice().multiply(BigDecimal.valueOf(quantity));

            // Create booking
            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setEventId(eventId);
            booking.setTicketId(ticketId);
            booking.setQuantity(quantity);
            booking.setTotalPrice(totalPrice);
            booking.setStatus(Booking.BookingStatus.PENDING);
            booking.setBookingReference(generateBookingReference());
            booking.setEventName(event.getName());
            booking.setTicketType(ticket.getType());
            booking.setTicketPrice(ticket.getPrice());

            return bookingRepository.save(booking);
        } catch (Exception e) {
            // Release reserved tickets if booking creation fails
            ticketServiceClient.releaseTickets(ticketId, quantity);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }

    @Transactional
    public Booking confirmBooking(Long bookingId, Payment.PaymentMethod paymentMethod, String transactionId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Validate booking can be confirmed
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking cannot be confirmed. Current status: " + booking.getStatus());
        }

        // Check if booking has expired
        if (booking.getBookingDate().plusMinutes(BOOKING_EXPIRY_MINUTES).isBefore(LocalDateTime.now())) {
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            // Release tickets
            ticketServiceClient.releaseTickets(booking.getTicketId(), booking.getQuantity());
            throw new RuntimeException("Booking has expired. Please create a new booking.");
        }

        // Create payment record
        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setAmount(booking.getTotalPrice());
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId(transactionId);
        payment.setPaymentGateway("INTERNAL"); // For demo purposes
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        // Update booking status
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Check if user owns the booking
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own bookings");
        }

        // Check if booking can be cancelled
        if (booking.getStatus() != Booking.BookingStatus.PENDING &&
                booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking cannot be cancelled. Current status: " + booking.getStatus());
        }

        // Check if pending booking has actually expired
        if (booking.getStatus() == Booking.BookingStatus.PENDING &&
                booking.getBookingDate().plusMinutes(BOOKING_EXPIRY_MINUTES).isBefore(LocalDateTime.now())) {
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            // Release tickets as they were reserved
            ticketServiceClient.releaseTickets(booking.getTicketId(), booking.getQuantity());
            throw new RuntimeException("Booking has expired and cannot be cancelled. It has been marked as expired.");
        }

        // Release tickets for BOTH Pending and Confirmed bookings
        // (Both statuses imply tickets are currently held/reserved)
        ticketServiceClient.releaseTickets(booking.getTicketId(), booking.getQuantity());

        // Handle refund if confirmed
        if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            // Update payment status if exists
            Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setStatus(Payment.PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            }
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public void expirePendingBookings() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(BOOKING_EXPIRY_MINUTES);
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(expiryTime);

        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            // Release reserved tickets
            ticketServiceClient.releaseTickets(booking.getTicketId(), booking.getQuantity());
        }
    }

    public Long getConfirmedBookingsCount(Long eventId) {
        return bookingRepository.countConfirmedBookingsByEventId(eventId);
    }

    public List<Booking> getExpiredBookings() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(BOOKING_EXPIRY_MINUTES);
        return bookingRepository.findExpiredBookings(expiryTime);
    }

    private String generateBookingReference() {
        return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}