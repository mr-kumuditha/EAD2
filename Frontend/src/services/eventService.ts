import api, { eventApi } from './api';
import type{ Event, CreateEventRequest, UpdateEventRequest } from '../types';

export const eventService = {
  // Get all events with optional filtering
  getEvents: (category?: string, search?: string, location?: string, date?: string): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories') params.append('category', category);
    if (search) params.append('search', search);
    if (location && location !== 'All Locations') params.append('location', location);
    if (date && date !== 'Any Date') params.append('date', date);

    return api.get<Event[]>(`/events?${params.toString()}`).then(response => response.data);
  },

  // Get event by ID
  getEvent: (id: number): Promise<Event> => {
    return api.get<Event>(`/events/${id}`).then(response => response.data);
  },

  // Create new event (Admin only) - uses JSON if no image, multipart if image provided
  createEvent: (eventData: CreateEventRequest): Promise<Event> => {
    const eventJson = {
      name: eventData.name,
      description: eventData.description,
      category: eventData.category,
      location: eventData.location,
      date: eventData.date,
      status: eventData.status || 'ACTIVE'
    };

    // If no image provided, use JSON endpoint via gateway
    if (!eventData.image) {
      return api.post<Event>('/events', eventJson, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.data);
    }

    // If image provided, use multipart endpoint directly to event service
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(eventJson)], { type: 'application/json' }));
    formData.append('image', eventData.image);

    return eventApi.post<Event>('/events', formData).then(response => response.data);
  },

  // Update event with optional image
  updateEvent: (id: number, eventData: UpdateEventRequest, imageFile?: File): Promise<Event> => {
    if (imageFile) {
      // Use multipart endpoint for image updates directly to event service
      const formData = new FormData();

      // Add event data as JSON string
      formData.append('event', new Blob([JSON.stringify(eventData)], { type: 'application/json' }));
      formData.append('image', imageFile);

      return eventApi.put<Event>(`/events/${id}`, formData).then(response => response.data);
    } else {
      // Use regular JSON endpoint for non-image updates via gateway
      return api.put<Event>(`/events/${id}`, eventData).then(response => response.data);
    }
  },

  // Delete event
  deleteEvent: (id: number): Promise<void> => {
    return api.delete(`/events/${id}`).then(response => response.data);
  },

  // Get user's events
  getUserEvents: (): Promise<Event[]> => {
    return api.get<Event[]>('/events/my-events').then(response => response.data);
  },

  // Get events between dates
  getEventsBetweenDates: (startDate: string, endDate: string): Promise<Event[]> => {
    return api.get<Event[]>(`/events/between?startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.data);
  },

  // Get events by category and status
  getEventsByCategoryAndStatus: (category: string, status: string): Promise<Event[]> => {
    return api.get<Event[]>(`/events/by-category-status?category=${category}&status=${status}`)
      .then(response => response.data);
  },

  // Get all events for admin (including inactive/cancelled/completed)
  getAllEvents: (): Promise<Event[]> => {
    return api.get<Event[]>('/events/all').then(response => response.data);
  }
};