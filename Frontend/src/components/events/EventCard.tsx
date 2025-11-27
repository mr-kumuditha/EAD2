import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LocationOn,
  Event,
  Category,
  Edit,
  Delete,
  ShoppingCart
} from '@mui/icons-material';
import type { Event as EventType } from '../../types';
import { useAuth } from '../../context/useAuth';

interface EventCardProps {
  event: EventType;
  onEdit?: (event: EventType) => void;
  onDelete?: (eventId: number) => void;
  bookingsData?: { current: number; total: number };
  isAdmin?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  bookingsData,
  isAdmin = false
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: EventType['status']) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: '#4caf50', color: '#ffffff' };
      case 'INACTIVE':
        return { bg: '#9e9e9e', color: '#ffffff' };
      case 'CANCELLED':
        return { bg: '#f44336', color: '#ffffff' };
      case 'COMPLETED':
        return { bg: '#2196f3', color: '#ffffff' };
      default:
        return { bg: '#9e9e9e', color: '#ffffff' };
    }
  };

  const canEditDelete = user && (user.role === 'ADMIN' || user.userId === event.createdBy);

  return (
    <Card
      sx={{
        maxWidth: isAdmin ? 400 : 380,
        width: '100%',
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        },
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.background.paper,
      }}
    >
      {/* Event Image */}
      <Box sx={{ position: 'relative', height: isAdmin ? 200 : 240 }}>
        <CardMedia
          component="img"
          height="100%"
          image={event.imageUrl || '/api/placeholder/400/240'}
          alt={event.name}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />

        {/* Subtle Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* Status Badge */}
        <Chip
          label={event.status}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: getStatusColor(event.status).bg,
            color: getStatusColor(event.status).color,
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 2,
          }}
        />

        {/* Past Event Badge */}
        {isPastEvent && (
          <Chip
            label="PAST EVENT"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'rgba(244, 67, 54, 0.9)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 2,
            }}
          />
        )}

        {/* Admin Action Buttons */}
        {canEditDelete && isAdmin && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              gap: 1,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              '.MuiCard-root:hover &': {
                opacity: 1,
              },
            }}
          >
            <IconButton
              onClick={() => onEdit?.(event)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
              }}
              size="small"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => onDelete?.(event.id)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
              }}
              size="small"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 3, pb: 2 }}>
        {/* Bookings Data for Admin */}
        {canEditDelete && bookingsData && isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Bookings: ${bookingsData.current}/${bookingsData.total}`}
              size="small"
              sx={{
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                fontWeight: 500,
              }}
            />
          </Box>
        )}

        {/* Event Name */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: isAdmin ? '1.25rem' : '1.5rem',
            mb: 2,
            lineHeight: 1.2,
            color: theme.palette.text.primary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.name}
        </Typography>

        {/* Event Description */}
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.4rem',
          }}
        >
          {event.description}
        </Typography>

        {/* Event Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocationOn sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {event.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Event sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {formatDate(event.date)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Category sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
              {event.category}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              sx={{
                flex: 1,
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Get Tickets
            </Button>
          )}

          {canEditDelete && isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => onEdit?.(event)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={() => onDelete?.(event.id)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard;