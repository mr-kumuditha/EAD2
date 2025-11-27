import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  Paper,
  Stack,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import type { Event } from '../types';
import { eventService } from '../services/eventService';



const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { message: 'Please log in to view events.' } });
    }
  }, [user, navigate]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  // Sample categories - in real app, you might fetch these from API
  const categories = [
    'All Categories',
    'Technology',
    'Music',
    'Business',
    'Arts',
    'Sports',
    'Food & Drink',
    'Health & Wellness',
    'Education'
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Upcoming)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'category', label: 'Category' },
  ];

  // Filter and sort events
  const filteredAndSortedEvents = React.useMemo(() => {
    const filtered = events.filter(event => {
      const matchesCategory = selectedCategory === 'All Categories' || event.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return filtered;
  }, [events, selectedCategory, searchQuery, sortBy]);

  // Paginated events
  const paginatedEvents = React.useMemo(() => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [filteredAndSortedEvents, currentPage, eventsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / eventsPerPage);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const category = selectedCategory === 'All Categories' ? '' : selectedCategory;
      const eventsData = await eventService.getEvents(category, searchQuery);
      setEvents(eventsData);
    } catch (err: unknown) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
    fetchEvents();
  };

  const handleFavoriteToggle = (eventId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  if (!user) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B1020 0%, #1a1f35 50%, #0B1020 100%)'
      }}>
        <Typography variant="h6" sx={{ color: '#E6F0FF' }}>
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1020 0%, #1a1f35 50%, #0B1020 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            icon={<EventIcon />}
            label="Event Discovery"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(15, 98, 254, 0.1)',
              border: '1px solid rgba(15, 98, 254, 0.3)',
              color: '#E6F0FF',
              backdropFilter: 'blur(10px)',
              '& .MuiChip-icon': { color: '#00D1FF' }
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              color: '#E6F0FF',
              mb: 3,
              lineHeight: 1.2
            }}
          >
            Discover Amazing{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(45deg, #0F62FE, #00D1FF, #FF4785)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Events
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#B8C5D6',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Find and book tickets for the best events happening around you. From concerts to conferences, we've got something for everyone.
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 4,
            background: 'rgba(17, 20, 34, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(15, 98, 254, 0.2)',
          }}
        >
          <Grid container spacing={3}>
            {/* Category Filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#E6F0FF', '&.Mui-focused': { color: '#00D1FF' } }}>
                  <CategoryIcon sx={{ mr: 1 }} />
                  Filter by Category
                </InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Filter by Category"
                  sx={{
                    backgroundColor: 'rgba(11, 16, 32, 0.8)',
                    border: '1px solid rgba(15, 98, 254, 0.3)',
                    borderRadius: 3,
                    color: '#E6F0FF',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-icon': { color: '#00D1FF' },
                    '&:hover': {
                      backgroundColor: 'rgba(11, 16, 32, 0.9)',
                      border: '1px solid rgba(15, 98, 254, 0.5)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(11, 16, 32, 0.9)',
                      border: '1px solid #00D1FF',
                      boxShadow: '0 0 0 2px rgba(0, 209, 255, 0.2)',
                    }
                  }}
                >
                  {categories.map(category => (
                    <MenuItem
                      key={category}
                      value={category}
                      sx={{
                        backgroundColor: 'rgba(11, 16, 32, 0.9)',
                        color: '#E6F0FF',
                        '&:hover': { backgroundColor: 'rgba(15, 98, 254, 0.1)' },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(15, 98, 254, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(15, 98, 254, 0.3)' }
                        }
                      }}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Options */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#E6F0FF', '&.Mui-focused': { color: '#00D1FF' } }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Sort by
                </InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                  sx={{
                    backgroundColor: 'rgba(11, 16, 32, 0.8)',
                    border: '1px solid rgba(15, 98, 254, 0.3)',
                    borderRadius: 3,
                    color: '#E6F0FF',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '& .MuiSelect-icon': { color: '#00D1FF' },
                    '&:hover': {
                      backgroundColor: 'rgba(11, 16, 32, 0.9)',
                      border: '1px solid rgba(15, 98, 254, 0.5)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(11, 16, 32, 0.9)',
                      border: '1px solid #00D1FF',
                      boxShadow: '0 0 0 2px rgba(0, 209, 255, 0.2)',
                    }
                  }}
                >
                  {sortOptions.map(option => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{
                        backgroundColor: 'rgba(11, 16, 32, 0.9)',
                        color: '#E6F0FF',
                        '&:hover': { backgroundColor: 'rgba(15, 98, 254, 0.1)' },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(15, 98, 254, 0.2)',
                          '&:hover': { backgroundColor: 'rgba(15, 98, 254, 0.3)' }
                        }
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search Input */}
            <Grid size={{ xs: 12, md: 5 }}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by event name or description..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#00D1FF' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{
                            background: 'linear-gradient(45deg, #0F62FE, #00D1FF)',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #00D1FF, #FF4785)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(15, 98, 254, 0.4)',
                            }
                          }}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(11, 16, 32, 0.8)',
                      border: '1px solid rgba(15, 98, 254, 0.3)',
                      borderRadius: 3,
                      color: '#E6F0FF',
                      '& fieldset': { border: 'none' },
                      '&:hover': {
                        backgroundColor: 'rgba(11, 16, 32, 0.9)',
                        border: '1px solid rgba(15, 98, 254, 0.5)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(11, 16, 32, 0.9)',
                        border: '1px solid #00D1FF',
                        boxShadow: '0 0 0 2px rgba(0, 209, 255, 0.2)',
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      '&::placeholder': { color: '#B8C5D6', opacity: 1 },
                    }
                  }}
                />
              </form>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              '& .MuiAlert-icon': { color: '#fca5a5' }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Events Count and Admin Actions */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#E6F0FF' }}>
              {loading ? 'Loading events...' : `${filteredAndSortedEvents.length} events found`}
            </Typography>
            {!loading && filteredAndSortedEvents.length > 0 && (
              <Chip
                icon={<EventIcon />}
                label="Live Events"
                sx={{
                  backgroundColor: 'rgba(15, 98, 254, 0.1)',
                  border: '1px solid rgba(15, 98, 254, 0.3)',
                  color: '#B8C5D6',
                  '& .MuiChip-icon': { color: '#00D1FF' }
                }}
              />
            )}
          </Box>
          {user?.role === 'ADMIN' && (
            <Button
              component={RouterLink}
              to="/admin"
              variant="contained"
              startIcon={<EventIcon />}
              sx={{
                background: 'linear-gradient(45deg, #FF4785, #00D1FF)',
                borderRadius: 3,
                px: 4,
                py: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00D1FF, #0F62FE)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 71, 133, 0.4)',
                }
              }}
            >
              Create New Event
            </Button>
          )}
        </Box>

        {/* Events Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: '#B8C5D6' }}>
              Loading events...
            </Typography>
          </Box>
        ) : paginatedEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <EventIcon sx={{ fontSize: 64, color: '#B8C5D6', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" sx={{ color: '#B8C5D6', mb: 2 }}>
              No events found
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B' }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {paginatedEvents.map(event => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
                <Fade in={true} timeout={500}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(17, 20, 34, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(15, 98, 254, 0.2)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(15, 98, 254, 0.3)',
                        border: '1px solid rgba(15, 98, 254, 0.5)',
                      }
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Image */}
                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                      {event.imageUrl ? (
                        <CardMedia
                          component="img"
                          height="200"
                          image={event.imageUrl}
                          alt={event.name}
                          sx={{
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(15, 98, 254, 0.1), rgba(0, 209, 255, 0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EventIcon sx={{ fontSize: 48, color: '#B8C5D6', opacity: 0.5 }} />
                        </Box>
                      )}

                      {/* Status Badges */}
                      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                        {event.status === 'ACTIVE' && (
                          <Chip
                            label="Active"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(34, 197, 94, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                        {new Date(event.date) < new Date() && (
                          <Chip
                            label="Past"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(156, 163, 175, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>

                      {/* Favorite Button */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(event.id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {favorites.has(event.id) ? (
                          <FavoriteIcon sx={{ color: '#FF4785' }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: '#E6F0FF' }} />
                        )}
                      </IconButton>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Category */}
                      <Chip
                        label={event.category}
                        size="small"
                        sx={{
                          mb: 2,
                          backgroundColor: 'rgba(15, 98, 254, 0.1)',
                          border: '1px solid rgba(15, 98, 254, 0.3)',
                          color: '#00D1FF',
                          fontWeight: 600
                        }}
                      />

                      {/* Event Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#E6F0FF',
                          mb: 2,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#B8C5D6',
                          mb: 3,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {event.description}
                      </Typography>

                      {/* Date & Location */}
                      <Stack spacing={1} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#00D1FF' }} />
                          <Typography variant="body2" sx={{ color: '#B8C5D6' }}>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#00D1FF' }} />
                          <Typography variant="body2" sx={{ color: '#B8C5D6' }}>
                            {event.location}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Buy Ticket Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}`);
                        }}
                        sx={{
                          background: 'linear-gradient(45deg, #0F62FE, #00D1FF)',
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #00D1FF, #FF4785)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(15, 98, 254, 0.4)',
                          }
                        }}
                      >
                        Buy Ticket
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Stack direction="row" spacing={1}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'contained' : 'outlined'}
                  onClick={() => handlePageChange(page)}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 2,
                    ...(currentPage === page && {
                      background: 'linear-gradient(45deg, #0F62FE, #00D1FF)',
                      '&:hover': { background: 'linear-gradient(45deg, #00D1FF, #FF4785)' }
                    })
                  }}
                >
                  {page}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Call to Action for Non-Logged In Users */}
        {!user && (
          <Paper
            elevation={3}
            sx={{
              p: 6,
              mt: 8,
              borderRadius: 4,
              background: 'rgba(17, 20, 34, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(15, 98, 254, 0.2)',
              textAlign: 'center'
            }}
          >
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Chip
                icon={<EventIcon />}
                label="Join EventHub"
                sx={{
                  mb: 4,
                  backgroundColor: 'rgba(15, 98, 254, 0.1)',
                  border: '1px solid rgba(15, 98, 254, 0.3)',
                  color: '#E6F0FF',
                  '& .MuiChip-icon': { color: '#00D1FF' }
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#E6F0FF', mb: 3 }}>
                Ready to Book Your Spot?
              </Typography>
              <Typography variant="body1" sx={{ color: '#B8C5D6', mb: 4, lineHeight: 1.6 }}>
                Create an account to book events, save your favorites, and get personalized recommendations tailored just for you.
              </Typography>
              <Button
                component={RouterLink}
                to="/auth"
                variant="contained"
                startIcon={<EventIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #0F62FE, #00D1FF)',
                  borderRadius: 3,
                  px: 6,
                  py: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00D1FF, #FF4785)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(15, 98, 254, 0.4)',
                  }
                }}
              >
                Sign Up Now
              </Button>
            </Box>
          </Paper>
        )}

        {/* Event Detail Modal */}
        <Dialog
          open={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'white',
              borderRadius: 4,
              maxHeight: '90vh',
              overflow: 'hidden'
            }
          }}
        >
          {selectedEvent && (
            <>
              <DialogContent sx={{ p: 0 }}>
                {/* Header with Event Image */}
                <Box sx={{ position: 'relative', height: 300, overflow: 'hidden' }}>
                  {selectedEvent.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedEvent.imageUrl}
                      alt={selectedEvent.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb, #f9fafb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <EventIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2, opacity: 0.8 }} />
                        <Typography variant="h5" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                          {selectedEvent.category}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Overlay with gradient */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.3), transparent)'
                    }}
                  />

                  {/* Close button */}
                  <IconButton
                    onClick={() => setSelectedEvent(null)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>

                  {/* Event title */}
                  <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {selectedEvent.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 4, space: 2 }}>
                  {/* Description */}
                  <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ color: '#6366f1' }} />
                      About this event
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                      {selectedEvent.description}
                    </Typography>
                  </Paper>

                  {/* Event Details Grid */}
                  <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={3}>
                        <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#eef2ff',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <LocationIcon sx={{ color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              Location
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: '#475569' }}>
                            {selectedEvent.location}
                          </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#eef2ff',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <CalendarIcon sx={{ color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              Date & Time
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: '#475569' }}>
                            {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Paper>
                      </Stack>
                    </Grid>

                    {/* Right Column */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={3}>
                        <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#eef2ff',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <CategoryIcon sx={{ color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              Category
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: '#475569' }}>
                            {selectedEvent.category}
                          </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#eef2ff',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <EventIcon sx={{ color: '#6366f1' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              Event ID
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: '#475569' }}>
                            #{selectedEvent.id}
                          </Typography>
                        </Paper>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 4, pt: 0, gap: 2 }}>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Share Event
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CartIcon />}
                  onClick={() => {
                    navigate(`/events/${selectedEvent.id}`);
                  }}
                  sx={{
                    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                    borderRadius: 2,
                    px: 6,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    }
                  }}
                >
                  Book Tickets Now
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default EventsPage;