package com.eventhub.ticketservice.controller;

import com.eventhub.ticketservice.model.Ticket;
import com.eventhub.ticketservice.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // GET /tickets - Get all tickets (Admin only)
    @GetMapping
    public ResponseEntity<?> getAllTickets(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view all tickets");
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /tickets/event/{eventId} - Get all tickets for an event
    @GetMapping("/event/{eventId}")
    public List<Ticket> getTicketsByEventId(@PathVariable Long eventId) {
        return ticketService.getTicketsByEventId(eventId);
    }

    // GET /tickets/event/{eventId}/status/{status} - Get tickets by event and status
    @GetMapping("/event/{eventId}/status/{status}")
    public List<Ticket> getTicketsByEventIdAndStatus(@PathVariable Long eventId,
                                                     @PathVariable Ticket.TicketStatus status) {
        return ticketService.getTicketsByEventIdAndStatus(eventId, status);
    }

    // GET /tickets/event/{eventId}/available - Get available tickets for an event
    @GetMapping("/event/{eventId}/available")
    public List<Ticket> getAvailableTicketsByEventId(@PathVariable Long eventId) {
        return ticketService.getAvailableTicketsByEventId(eventId);
    }

    // GET /tickets/{id} - Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        Optional<Ticket> ticket = ticketService.getTicketById(id);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /tickets/event/{eventId}/type/{type} - Get ticket by event and type
    @GetMapping("/event/{eventId}/type/{type}")
    public ResponseEntity<?> getTicketByEventAndType(@PathVariable Long eventId,
                                                     @PathVariable Ticket.TicketType type) {
        Optional<Ticket> ticket = ticketService.getTicketByEventAndType(eventId, type);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST /tickets - Create new ticket (Admin only)
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket,
                                          @RequestHeader("X-User-Id") Long userId,
                                          @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can create tickets");
            }
            Ticket savedTicket = ticketService.createTicket(ticket);
            return ResponseEntity.ok(savedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /tickets/event/{eventId}/default - Create default tickets for event (Admin only)
    @PostMapping("/event/{eventId}/default")
    public ResponseEntity<?> createDefaultTickets(@PathVariable Long eventId,
                                                  @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can create tickets");
            }
            ticketService.createDefaultTicketsForEvent(eventId);
            return ResponseEntity.ok("Default tickets created successfully for event: " + eventId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /tickets/{id} - Update ticket (Admin only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Long id,
                                          @RequestBody Ticket ticketDetails,
                                          @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can update tickets");
            }
            Ticket updatedTicket = ticketService.updateTicket(id, ticketDetails);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /tickets/{id} - Delete ticket (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id,
                                          @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can delete tickets");
            }
            ticketService.deleteTicket(id);
            return ResponseEntity.ok("Ticket deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /tickets/event/{eventId} - Delete all tickets for an event (Admin only)
    @DeleteMapping("/event/{eventId}")
    public ResponseEntity<?> deleteTicketsByEventId(@PathVariable Long eventId,
                                                    @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can delete tickets");
            }
            ticketService.deleteTicketsByEventId(eventId);
            return ResponseEntity.ok("All tickets deleted for event: " + eventId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /tickets/{ticketId}/reserve - Reserve tickets
    @PostMapping("/{ticketId}/reserve")
    public ResponseEntity<?> reserveTickets(@PathVariable Long ticketId,
                                            @RequestParam Integer quantity) {
        try {
            boolean reserved = ticketService.reserveTickets(ticketId, quantity);
            if (reserved) {
                return ResponseEntity.ok("Tickets reserved successfully");
            } else {
                return ResponseEntity.badRequest().body("Not enough tickets available");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reserve tickets: " + e.getMessage());
        }
    }

    // POST /tickets/{ticketId}/release - Release reserved tickets
    @PostMapping("/{ticketId}/release")
    public ResponseEntity<?> releaseTickets(@PathVariable Long ticketId,
                                            @RequestParam Integer quantity) {
        try {
            ticketService.releaseTickets(ticketId, quantity);
            return ResponseEntity.ok("Tickets released successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to release tickets: " + e.getMessage());
        }
    }

    // GET /tickets/{ticketId}/availability - Check ticket availability
    @GetMapping("/{ticketId}/availability")
    public ResponseEntity<?> checkAvailability(@PathVariable Long ticketId,
                                               @RequestParam Integer quantity) {
        try {
            boolean available = ticketService.isTicketAvailable(ticketId, quantity);
            Integer availableQuantity = ticketService.getAvailableQuantity(ticketId);

            return ResponseEntity.ok(new AvailabilityResponse(available, availableQuantity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to check availability: " + e.getMessage());
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Ticket Service is running");
    }

    // Helper class for availability response
    private static class AvailabilityResponse {
        public boolean available;
        public Integer availableQuantity;

        public AvailabilityResponse(boolean available, Integer availableQuantity) {
            this.available = available;
            this.availableQuantity = availableQuantity;
        }
    }
}