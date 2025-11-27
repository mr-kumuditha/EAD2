package com.eventhub.eventservice.service;

import com.eventhub.eventservice.model.Event;
import com.eventhub.eventservice.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getActiveEvents() {
        return eventRepository.findByStatus(Event.EventStatus.ACTIVE);
    }

    public List<Event> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    public List<Event> searchEvents(String query) {
        return eventRepository.searchEvents(query);
    }

    public List<Event> findByCategoryAndStatus(String category, Event.EventStatus status) {
        return eventRepository.findByCategoryAndStatus(category, status);
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public Event createEvent(Event event, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = fileStorageService.storeFile(imageFile);
                event.setImageUrl(imageUrl);
            } catch (Exception e) {
                throw new RuntimeException("Could not store image file: " + e.getMessage());
            }
        }
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails, Long userId, String role) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();

            // Allow admins to update any event, or users to update their own events
            if (!"ADMIN".equals(role) && !event.getCreatedBy().equals(userId)) {
                throw new RuntimeException("You can only update events you created");
            }

            event.setName(eventDetails.getName());
            event.setDescription(eventDetails.getDescription());
            event.setCategory(eventDetails.getCategory());
            event.setLocation(eventDetails.getLocation());
            event.setDate(eventDetails.getDate());
            event.setStatus(eventDetails.getStatus());

            return eventRepository.save(event);
        }
        throw new RuntimeException("Event not found with id: " + id);
    }

    public Event updateEventWithImage(Long id, Event eventDetails, MultipartFile imageFile, Long userId, String role) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();

            // Allow admins to update any event, or users to update their own events
            if (!"ADMIN".equals(role) && !event.getCreatedBy().equals(userId)) {
                throw new RuntimeException("You can only update events you created");
            }

            // Update image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    // Delete old image if exists
                    if (event.getImageUrl() != null) {
                        fileStorageService.deleteFile(event.getImageUrl());
                    }
                    String imageUrl = fileStorageService.storeFile(imageFile);
                    event.setImageUrl(imageUrl);
                } catch (Exception e) {
                    throw new RuntimeException("Could not store image file: " + e.getMessage());
                }
            }

            event.setName(eventDetails.getName());
            event.setDescription(eventDetails.getDescription());
            event.setCategory(eventDetails.getCategory());
            event.setLocation(eventDetails.getLocation());
            event.setDate(eventDetails.getDate());
            event.setStatus(eventDetails.getStatus());

            return eventRepository.save(event);
        }
        throw new RuntimeException("Event not found with id: " + id);
    }

    public List<Event> findEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return eventRepository.findEventsBetweenDates(startDate, endDate);
    }

    public void deleteEvent(Long id, Long userId, String role) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();

            // Allow admins to delete any event, or users to delete their own events
            if (!"ADMIN".equals(role) && !event.getCreatedBy().equals(userId)) {
                throw new RuntimeException("You can only delete events you created");
            }

            // Delete associated image file
            if (event.getImageUrl() != null) {
                fileStorageService.deleteFile(event.getImageUrl());
            }

            eventRepository.deleteById(id);
        } else {
            throw new RuntimeException("Event not found with id: " + id);
        }
    }

    public List<Event> getUserEvents(Long userId) {
        return eventRepository.findByCreatedBy(userId);
    }

    // Get total event count
    public long getTotalEventCount() {
        return eventRepository.count();
    }

    // Get total booking count (simplified - assuming each event has a booking count)
    public long getTotalBookingCount() {
        // This is a simplified implementation. In a real system, you'd have a separate Booking entity
        // For now, we'll sum up some mock booking numbers or return a static value
        return 1248; // Mock value matching the frontend
    }

    // Get total revenue (simplified)
    public double getTotalRevenue() {
        // This is a simplified implementation. In a real system, you'd calculate from Payment entities
        return 45678.00; // Mock value matching the frontend
    }

    // Get recent events (last 4 events ordered by creation date)
    public List<Event> getRecentEvents(int limit) {
        return eventRepository.findTopByOrderByCreatedAtDesc(limit);
    }
}
