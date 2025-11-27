import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Stack, IconButton } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import type { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { CalendarToday } from '@mui/icons-material';

interface EventCalendarProps {
  compact?: boolean;
  showNavigation?: boolean;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  compact = false,
  showNavigation = true
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await eventService.getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date: Dayjs) => {
    return events.filter(event => {
      const eventDate = dayjs(event.date);
      return eventDate.isSame(date, 'day') && event.status === 'ACTIVE';
    });
  };

  // Get all dates that have events
  const getEventDates = () => {
    return events
      .filter(event => event.status === 'ACTIVE')
      .map(event => dayjs(event.date).format('YYYY-MM-DD'));
  };



  const eventDates = getEventDates();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading calendar...
        </Typography>
      </Paper>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        sx={{
          p: compact ? 2 : 3,
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {showNavigation && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Event Calendar
            </Typography>
            <IconButton component={Link} to="/events" size="small">
              <CalendarToday sx={{ fontSize: 20, color: 'accent.main' }} />
            </IconButton>
          </Box>
        )}

        <DateCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          sx={{
            width: '100%',
            '& .MuiPickersCalendarHeader-root': {
              paddingLeft: 0,
              paddingRight: 0,
              marginBottom: 1,
            },
            '& .MuiPickersCalendarHeader-label': {
              fontSize: compact ? '1rem' : '1.25rem',
              fontWeight: 600,
              color: 'text.primary',
            },
            '& .MuiDayCalendar-root': {
              width: '100%',
            },
            '& .MuiDayCalendar-weekContainer': {
              justifyContent: 'space-around',
            },
            '& .MuiPickersDay-root': {
              width: compact ? 32 : 36,
              height: compact ? 32 : 36,
              fontSize: compact ? '0.75rem' : '0.875rem',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                display: 'none',
              },
            },
            // Show red dot for dates with events
            ...eventDates.reduce((acc, dateStr) => {
              const date = dayjs(dateStr);
              const day = date.date();
              const month = date.month();
              const year = date.year();
              return {
                ...acc,
                [`& .MuiPickersDay-root[data-day="${day}"][data-month="${month}"][data-year="${year}"]::after`]: {
                  display: 'block',
                },
              };
            }, {}),
          }}
        />

        {/* Selected Date Events */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
              Events on {selectedDate.format('MMM D, YYYY')}
            </Typography>
            <Stack spacing={1}>
              {selectedDateEvents.slice(0, compact ? 2 : 5).map((event) => (
                <Box
                  key={event.id}
                  component={Link}
                  to={`/events/${event.id}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {event.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {event.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={event.category}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      backgroundColor: 'accent.main',
                      color: 'white',
                    }}
                  />
                </Box>
              ))}
              {selectedDateEvents.length > (compact ? 2 : 5) && (
                <Typography variant="caption" sx={{ color: 'accent.main', textAlign: 'center', mt: 1 }}>
                  +{selectedDateEvents.length - (compact ? 2 : 5)} more events
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'error.main',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Events
            </Typography>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default EventCalendar;
