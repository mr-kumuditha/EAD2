package com.eventhub.ticketservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Event ID is required")
    @Column(nullable = false)
    private Long eventId;

    @NotNull(message = "Ticket type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketType type;

    @NotNull(message = "Price is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Quantity available is required")
    @Min(value = 0, message = "Quantity available cannot be negative")
    @Column(nullable = false)
    private Integer quantityAvailable;

    @NotNull(message = "Max tickets per user is required")
    @Min(value = 1, message = "Max tickets per user must be at least 1")
    @Column(nullable = false)
    private Integer maxPerUser = 10;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.AVAILABLE;

    private LocalDateTime saleStartDate;
    private LocalDateTime saleEndDate;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Simplified to only 3 ticket types
    public enum TicketType {
        EARLY_BIRD,
        STANDARD,
        VIP
    }

    public enum TicketStatus {
        AVAILABLE,
        SOLD_OUT,
        INACTIVE
    }
}