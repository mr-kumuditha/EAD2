package com.eventhub.eventservice.controller;

import com.eventhub.eventservice.model.Event;
import com.eventhub.eventservice.service.EventService;
import com.eventhub.eventservice.service.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    // GET /events - Get all active events
    @GetMapping
    public List<Event> getAllEvents(@RequestParam(required = false) String category,
                                    @RequestParam(required = false) String search) {
        if (category != null && !category.isEmpty()) {
            return eventService.getEventsByCategory(category);
        }
        if (search != null && !search.isEmpty()) {
            return eventService.searchEvents(search);
        }
        return eventService.getActiveEvents();
    }

    // GET /events/{id} - Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        Optional<Event> event = eventService.getEventById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(event.get());
        }
        return ResponseEntity.notFound().build();
    }

    // POST /events - Create new event without image (Admin only)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createEventJson(
            @RequestBody Event event,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can create events");
            }
            event.setCreatedBy(userId);
            Event savedEvent = eventService.createEvent(event, null);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating event: " + e.getMessage());
        }
    }

    // POST /events - Create new event with image (Admin only)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createEvent(
            @RequestPart("event") String eventJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        try {
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.badRequest().body("Only admins can create events");
            }
            Event event = parseEventPayload(eventJson);
            event.setCreatedBy(userId);
            Event savedEvent = eventService.createEvent(event, imageFile);
            return ResponseEntity.ok(savedEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating event: " + e.getMessage());
        }
    }

    // PUT /events/{id} - Update event (JSON)
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateEventJson(
            @PathVariable Long id,
            @RequestBody Event eventDetails,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        try {
            Event updatedEvent = eventService.updateEvent(id, eventDetails, userId, role);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /events/{id} - Update event with optional image
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateEventWithImage(
            @PathVariable Long id,
            @RequestPart("event") String eventJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        try {
            Event eventDetails = parseEventPayload(eventJson);
            Event updatedEvent;
            if (imageFile != null && !imageFile.isEmpty()) {
                updatedEvent = eventService.updateEventWithImage(id, eventDetails, imageFile, userId, role);
            } else {
                updatedEvent = eventService.updateEvent(id, eventDetails, userId, role);
            }
            return ResponseEntity.ok(updatedEvent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private Event parseEventPayload(String eventJson) {
        if (eventJson == null || eventJson.isBlank()) {
            throw new IllegalArgumentException("Event payload is missing");
        }
        try {
            return objectMapper.readValue(eventJson, Event.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid event payload", e);
        }
    }

    // Serve uploaded images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.loadFile(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg"; // Default content type
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /events/between - Get events between startDate and endDate
    @GetMapping("/between")
    public List<Event> findEventsBetweenDates(@RequestParam("startDate") String startDate,
                                              @RequestParam("endDate") String endDate) {
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        return eventService.findEventsBetweenDates(start, end);
    }

    // DELETE /events/{id} - Delete event
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id,
                                         @RequestHeader("X-User-Id") Long userId,
                                         @RequestHeader("X-User-Role") String role) {
        try {
            eventService.deleteEvent(id, userId, role);
            return ResponseEntity.ok("Event deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /events/all - Get all events (including inactive ones, Admin only)
    @GetMapping("/all")
    public ResponseEntity<?> getAllEvents(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view all events");
        }
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // GET /events/by-category-status - Get events by category and status
    @GetMapping("/by-category-status")
    public List<Event> getEventsByCategoryAndStatus(
            @RequestParam String category,
            @RequestParam String status) {
        Event.EventStatus eventStatus = Event.EventStatus.valueOf(status.toUpperCase());
        return eventService.findByCategoryAndStatus(category, eventStatus);
    }

    // GET /events/my-events - Get events created by user
    @GetMapping("/my-events")
    public List<Event> getUserEvents(@RequestHeader("X-User-Id") Long userId) {
        return eventService.getUserEvents(userId);
    }

    // GET /events/stats - Get dashboard statistics (Admin only)
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view statistics");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", eventService.getTotalEventCount());
        stats.put("totalBookings", eventService.getTotalBookingCount());
        stats.put("totalRevenue", eventService.getTotalRevenue());
        stats.put("totalUsers", 0); // Will be fetched from auth-service

        return ResponseEntity.ok(stats);
    }

    // GET /events/recent - Get recent events (Admin only)
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentEvents(@RequestHeader("X-User-Role") String role) {
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Only admins can view recent events");
        }

        List<Event> recentEvents = eventService.getRecentEvents(4);
        return ResponseEntity.ok(recentEvents);
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Event Service is running");
    }
}
