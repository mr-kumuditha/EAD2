package com.eventhub.bookingservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component
public class TicketServiceClient {

    private final RestTemplate restTemplate;
    private final String ticketServiceUrl;

    public TicketServiceClient(RestTemplate restTemplate,
                               @Value("${service.ticket}") String ticketServiceUrl) {
        this.restTemplate = restTemplate;
        this.ticketServiceUrl = ticketServiceUrl;
    }

    public Ticket getTicketById(Long ticketId) {
        try {
            ResponseEntity<Ticket> response = restTemplate.getForEntity(
                    ticketServiceUrl + "/tickets/" + ticketId, Ticket.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch ticket: " + e.getMessage());
        }
    }

    public boolean reserveTickets(Long ticketId, Integer quantity) {
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    ticketServiceUrl + "/tickets/" + ticketId + "/reserve?quantity=" + quantity,
                    null, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            throw new RuntimeException("Failed to reserve tickets: " + e.getMessage());
        }
    }

    public void releaseTickets(Long ticketId, Integer quantity) {
        try {
            restTemplate.postForEntity(
                    ticketServiceUrl + "/tickets/" + ticketId + "/release?quantity=" + quantity,
                    null, String.class);
        } catch (Exception e) {
            // Log the error but don't throw - this is cleanup operation
            System.err.println("Failed to release tickets: " + e.getMessage());
        }
    }

    public AvailabilityResponse checkAvailability(Long ticketId, Integer quantity) {
        try {
            ResponseEntity<AvailabilityResponse> response = restTemplate.getForEntity(
                    ticketServiceUrl + "/tickets/" + ticketId + "/availability?quantity=" + quantity,
                    AvailabilityResponse.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to check availability: " + e.getMessage());
        }
    }

    public static class Ticket {
        private Long id;
        private Long eventId;
        private String type;
        private BigDecimal price;
        private Integer quantityAvailable;
        private Integer maxPerUser;
        private String status;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getQuantityAvailable() { return quantityAvailable; }
        public void setQuantityAvailable(Integer quantityAvailable) { this.quantityAvailable = quantityAvailable; }
        public Integer getMaxPerUser() { return maxPerUser; }
        public void setMaxPerUser(Integer maxPerUser) { this.maxPerUser = maxPerUser; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AvailabilityResponse {
        private boolean available;
        private Integer availableQuantity;

        // Getters and setters
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
        public Integer getAvailableQuantity() { return availableQuantity; }
        public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }
    }
}