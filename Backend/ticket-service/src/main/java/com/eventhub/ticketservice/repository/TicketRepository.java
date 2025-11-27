package com.eventhub.ticketservice.repository;

import com.eventhub.ticketservice.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEventId(Long eventId);

    List<Ticket> findByEventIdAndStatus(Long eventId, Ticket.TicketStatus status);

    Optional<Ticket> findByEventIdAndType(Long eventId, Ticket.TicketType type);

    @Query("SELECT t FROM Ticket t WHERE t.eventId = :eventId AND t.status = 'AVAILABLE' AND " +
            "(t.saleStartDate IS NULL OR t.saleStartDate <= CURRENT_TIMESTAMP) AND " +
            "(t.saleEndDate IS NULL OR t.saleEndDate >= CURRENT_TIMESTAMP)")
    List<Ticket> findAvailableTicketsByEventId(@Param("eventId") Long eventId);

    @Modifying
    @Query("UPDATE Ticket t SET t.quantityAvailable = t.quantityAvailable - :quantity WHERE t.id = :ticketId AND t.quantityAvailable >= :quantity")
    int decreaseQuantity(@Param("ticketId") Long ticketId, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE Ticket t SET t.quantityAvailable = t.quantityAvailable + :quantity WHERE t.id = :ticketId")
    int increaseQuantity(@Param("ticketId") Long ticketId, @Param("quantity") Integer quantity);

    boolean existsByEventIdAndType(Long eventId, Ticket.TicketType type);

    // New method to delete all tickets for an event
    void deleteByEventId(Long eventId);
}