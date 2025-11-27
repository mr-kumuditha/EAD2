package com.eventhub.eventservice.repository;

import com.eventhub.eventservice.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCategory(String category);

    List<Event> findByStatus(Event.EventStatus status);

    List<Event> findByCreatedBy(Long createdBy);

    @Query("SELECT e FROM Event e WHERE e.date >= :startDate AND e.date <= :endDate")
    List<Event> findEventsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT e FROM Event e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Event> searchEvents(@Param("query") String query);

    List<Event> findByCategoryAndStatus(String category, Event.EventStatus status);

    @Query("SELECT e FROM Event e ORDER BY e.createdAt DESC")
    List<Event> findTopByOrderByCreatedAtDesc(int limit);
}
