package com.eventhub.bookingservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class EventServiceClient {

    private final RestTemplate restTemplate;
    private final String eventServiceUrl;

    public EventServiceClient(RestTemplate restTemplate,
                              @Value("${service.event}") String eventServiceUrl) {
        this.restTemplate = restTemplate;
        this.eventServiceUrl = eventServiceUrl;
    }

    public Event getEventById(Long eventId) {
        try {
            ResponseEntity<Event> response = restTemplate.getForEntity(
                    eventServiceUrl + "/events/" + eventId, Event.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch event: " + e.getMessage());
        }
    }

    public static class Event {
        private Long id;
        private String name;
        private String description;
        private String location;
        private String date;
        private String status;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}