package com.eventhub.ticketservice.service;

import com.eventhub.ticketservice.model.Ticket;
import com.eventhub.ticketservice.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByEventId(Long eventId) {
        return ticketRepository.findByEventId(eventId);
    }

    public List<Ticket> getTicketsByEventIdAndStatus(Long eventId, Ticket.TicketStatus status) {
        return ticketRepository.findByEventIdAndStatus(eventId, status);
    }

    public List<Ticket> getAvailableTicketsByEventId(Long eventId) {
        return ticketRepository.findAvailableTicketsByEventId(eventId);
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Optional<Ticket> getTicketByEventAndType(Long eventId, Ticket.TicketType type) {
        return ticketRepository.findByEventIdAndType(eventId, type);
    }

    public Ticket createTicket(Ticket ticket) {
        // Check if ticket type already exists for this event
        if (ticketRepository.existsByEventIdAndType(ticket.getEventId(), ticket.getType())) {
            throw new RuntimeException("Ticket type " + ticket.getType() + " already exists for this event");
        }

        // Validate price
        if (ticket.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Ticket price cannot be negative");
        }

        // Validate quantity
        if (ticket.getQuantityAvailable() < 0) {
            throw new RuntimeException("Ticket quantity cannot be negative");
        }

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(Long id, Ticket ticketDetails) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();

            // Check if updating to a type that already exists for this event (excluding
            // current ticket)
            if (ticketDetails.getType() != null && !ticket.getType().equals(ticketDetails.getType())) {
                Optional<Ticket> existingTicket = ticketRepository.findByEventIdAndType(
                        ticket.getEventId(), ticketDetails.getType());
                if (existingTicket.isPresent() && !existingTicket.get().getId().equals(id)) {
                    throw new RuntimeException(
                            "Ticket type " + ticketDetails.getType() + " already exists for this event");
                }
            }

            // Only update fields that are provided (not null)
            if (ticketDetails.getType() != null) {
                ticket.setType(ticketDetails.getType());
            }
            if (ticketDetails.getPrice() != null) {
                // Validate price
                if (ticketDetails.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                    throw new RuntimeException("Ticket price cannot be negative");
                }
                ticket.setPrice(ticketDetails.getPrice());
            }
            if (ticketDetails.getQuantityAvailable() != null) {
                // Validate quantity
                if (ticketDetails.getQuantityAvailable() < 0) {
                    throw new RuntimeException("Ticket quantity cannot be negative");
                }
                ticket.setQuantityAvailable(ticketDetails.getQuantityAvailable());
            }
            if (ticketDetails.getMaxPerUser() != null) {
                ticket.setMaxPerUser(ticketDetails.getMaxPerUser());
            }
            if (ticketDetails.getDescription() != null) {
                ticket.setDescription(ticketDetails.getDescription());
            }
            if (ticketDetails.getStatus() != null) {
                ticket.setStatus(ticketDetails.getStatus());
            }
            if (ticketDetails.getSaleStartDate() != null) {
                ticket.setSaleStartDate(ticketDetails.getSaleStartDate());
            }
            if (ticketDetails.getSaleEndDate() != null) {
                ticket.setSaleEndDate(ticketDetails.getSaleEndDate());
            }

            return ticketRepository.save(ticket);
        }
        throw new RuntimeException("Ticket not found with id: " + id);
    }

    @Transactional
    public boolean reserveTickets(Long ticketId, Integer quantity) {
        int updatedRows = ticketRepository.decreaseQuantity(ticketId, quantity);
        if (updatedRows > 0) {
            // Update status to SOLD_OUT if quantity becomes 0
            Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
            if (ticketOpt.isPresent()) {
                Ticket ticket = ticketOpt.get();
                if (ticket.getQuantityAvailable() == 0) {
                    ticket.setStatus(Ticket.TicketStatus.SOLD_OUT);
                    ticketRepository.save(ticket);
                }
            }
            return true;
        }
        return false;
    }

    @Transactional
    public void releaseTickets(Long ticketId, Integer quantity) {
        ticketRepository.increaseQuantity(ticketId, quantity);

        // Update status back to AVAILABLE if quantity was 0
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            if (ticket.getStatus() == Ticket.TicketStatus.SOLD_OUT && ticket.getQuantityAvailable() > 0) {
                ticket.setStatus(Ticket.TicketStatus.AVAILABLE);
                ticketRepository.save(ticket);
            }
        }
    }

    public void deleteTicket(Long id) {
        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
        } else {
            throw new RuntimeException("Ticket not found with id: " + id);
        }
    }

    @Transactional
    public void deleteTicketsByEventId(Long eventId) {
        ticketRepository.deleteByEventId(eventId);
    }

    public boolean isTicketAvailable(Long ticketId, Integer quantity) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            return ticket.getStatus() == Ticket.TicketStatus.AVAILABLE &&
                    ticket.getQuantityAvailable() >= quantity &&
                    (ticket.getSaleStartDate() == null
                            || !ticket.getSaleStartDate().isAfter(java.time.LocalDateTime.now()))
                    &&
                    (ticket.getSaleEndDate() == null
                            || !ticket.getSaleEndDate().isBefore(java.time.LocalDateTime.now()));
        }
        return false;
    }

    public Integer getAvailableQuantity(Long ticketId) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        return ticketOpt.map(Ticket::getQuantityAvailable).orElse(0);
    }

    // New method to get tickets by status
    public List<Ticket> getTicketsByStatus(Ticket.TicketStatus status) {
        return ticketRepository.findByEventIdAndStatus(1L, status); // Example: get by status for a specific event
    }

    // New method to create default tickets for an event
    public void createDefaultTicketsForEvent(Long eventId) {
        // Create EARLY_BIRD ticket
        Ticket earlyBird = new Ticket();
        earlyBird.setEventId(eventId);
        earlyBird.setType(Ticket.TicketType.EARLY_BIRD);
        earlyBird.setPrice(new BigDecimal("49.99"));
        earlyBird.setQuantityAvailable(50);
        earlyBird.setMaxPerUser(2);
        earlyBird.setDescription("Early bird discounted tickets - Limited quantity!");
        createTicket(earlyBird);

        // Create STANDARD ticket
        Ticket standard = new Ticket();
        standard.setEventId(eventId);
        standard.setType(Ticket.TicketType.STANDARD);
        standard.setPrice(new BigDecimal("79.99"));
        standard.setQuantityAvailable(200);
        standard.setMaxPerUser(6);
        standard.setDescription("Standard admission ticket");
        createTicket(standard);

        // Create VIP ticket
        Ticket vip = new Ticket();
        vip.setEventId(eventId);
        vip.setType(Ticket.TicketType.VIP);
        vip.setPrice(new BigDecimal("149.99"));
        vip.setQuantityAvailable(20);
        vip.setMaxPerUser(4);
        vip.setDescription("VIP experience with premium benefits");
        createTicket(vip);
    }
}