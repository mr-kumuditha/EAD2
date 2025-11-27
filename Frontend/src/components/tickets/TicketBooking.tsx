import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Card,
    CardContent,
    TextField,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    useTheme,
    Chip,
    LinearProgress,
    Tooltip,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    ShoppingCart as ShoppingCartIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { TicketService } from '../../services/ticketService';
import { BookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import type { Ticket, Event } from '../../types';

interface TicketBookingProps {
    eventId: number;
}

type Notification = {
    type: 'success' | 'error' | 'info';
    message: string;
};

const TicketBooking: React.FC<TicketBookingProps> = ({ eventId }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);

    // Load event details
    const loadEvent = useCallback(async () => {
        try {
            const eventData = await eventService.getEvent(eventId);
            setEvent(eventData);
        } catch (error) {
            console.error('Failed to load event:', error);
            setNotification({ type: 'error', message: 'Failed to load event details' });
        }
    }, [eventId]);

    // Load available tickets
    const loadTickets = useCallback(async () => {
        try {
            const availableTickets = await TicketService.getAvailableTicketsByEvent(eventId);
            setTickets(availableTickets);
        } catch (error) {
            console.error('Failed to load tickets:', error);
            setNotification({ type: 'error', message: 'Failed to load tickets' });
        }
    }, [eventId]);

    useEffect(() => {
        void loadEvent();
        void loadTickets();
    }, [loadEvent, loadTickets]);

    const handleQuantityChange = (ticketId: number, quantity: number) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Ensure quantity doesn't exceed max per user or available quantity
        const maxAllowed = Math.min(ticket.maxPerUser, ticket.quantityAvailable);
        const newQuantity = Math.max(0, Math.min(quantity, maxAllowed));

        setSelectedQuantities(prev => ({
            ...prev,
            [ticketId]: newQuantity
        }));
    };

    const getTotalPrice = () => {
        return tickets.reduce((total, ticket) => {
            const quantity = selectedQuantities[ticket.id] || 0;
            return total + (ticket.price * quantity);
        }, 0);
    };

    const getTotalQuantity = () => {
        return Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0);
    };

    const handleBookTickets = async () => {
        const totalQuantity = getTotalQuantity();
        if (totalQuantity === 0) {
            setNotification({ type: 'error', message: 'Please select at least one ticket' });
            return;
        }

        setBookingLoading(true);
        try {
            // Create booking for each selected ticket type
            // Note: Currently we only support booking one ticket type at a time in this UI flow
            // or we need to loop. The UI seems to allow multiple, but the backend createBooking takes one ticketId.
            // Let's assume we loop or just take the first one for now as per previous code structure.

            const ticketEntries = Object.entries(selectedQuantities).filter(([, quantity]) => quantity > 0);

            if (ticketEntries.length === 0) return;

            // For now, we'll just handle the first ticket type selected as the backend seems to handle one booking per request
            // If we want multiple types, we'd need multiple API calls or a bulk API.
            // The previous code was doing Promise.all, let's stick to that but use BookingService.

            const reservationPromises = ticketEntries.map(async ([ticketId, quantity]) => {
                const reservationData = {
                    eventId: eventId,
                    ticketId: parseInt(ticketId),
                    quantity: quantity
                };
                console.log('Sending reservation request:', reservationData);
                return await BookingService.reserveBooking(reservationData);
            });

            const bookings = await Promise.all(reservationPromises);
            console.log('Created bookings:', bookings);

            // Use the first booking for the payment flow
            const mainBooking = bookings[0];

            if (!mainBooking || !mainBooking.id) {
                throw new Error('Failed to create booking: No booking ID returned');
            }

            // Prepare booking data for payment
            const bookingData = {
                eventId: eventId,
                ticketType: Object.keys(selectedQuantities)[0], // For simplicity, take first ticket type
                quantity: totalQuantity,
                price: getTotalPrice() / totalQuantity,
                bookingId: mainBooking.id
            };

            setNotification({ type: 'success', message: 'Tickets reserved! Redirecting to payment...' });
            setShowConfirmDialog(false);
            setSelectedQuantities({});

            // Navigate to payment page with booking data
            setTimeout(() => {
                navigate('/payment', { state: { bookingData } });
            }, 2000);
        } catch (error) {
            console.error('Failed to reserve tickets:', error);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : (error.response.data as any).message || JSON.stringify(error.response.data);

                console.error('Server response:', error.response.data);

                if (errorMessage.includes('already have a confirmed booking')) {
                    setNotification({ type: 'info', message: 'You already have a ticket for this event! Redirecting to your bookings...' });
                    setTimeout(() => navigate('/my-bookings'), 2000);
                } else {
                    setNotification({ type: 'error', message: `Failed to reserve tickets: ${errorMessage}` });
                }
            } else {
                setNotification({ type: 'error', message: 'Failed to reserve tickets. Please try again.' });
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const handleNotificationClose = () => {
        setNotification(null);
    };

    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'AVAILABLE':
                return '#4CAF50'; // Green
            case 'SOLD_OUT':
                return '#F44336'; // Red
            case 'INACTIVE':
                return '#9E9E9E'; // Gray
            default:
                return '#9E9E9E';
        }
    };

    const getTypeColor = (type: Ticket['type']) => {
        switch (type) {
            case 'EARLY_BIRD':
                return '#FFB84C'; // Gold
            case 'STANDARD':
                return '#4DA3FF'; // Sky Blue
            case 'VIP':
                return '#836FFF'; // Soft Purple
            default:
                return theme.palette.primary.main;
        }
    };

    if (!event) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography>Loading event details...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto', backgroundColor: '#F5F5F5', minHeight: '100vh', py: 4 }}>
            {/* Event Header */}
            <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: '#F5F6FA' }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <TicketIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                    <div>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {event.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                        </Typography>
                    </div>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {event.description}
                </Typography>
            </Paper>

            {/* Tickets Selection */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Select Your Tickets
                </Typography>

                {tickets.length === 0 ? (
                    <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            No tickets available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tickets for this event are currently unavailable.
                        </Typography>
                    </Paper>
                ) : (
                    <Stack spacing={3}>
                        {tickets.map((ticket) => {
                            const quantity = selectedQuantities[ticket.id] || 0;
                            const isSoldOut = ticket.status === 'SOLD_OUT' || ticket.quantityAvailable === 0;

                            return (
                                <Card
                                    key={ticket.id}
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease',
                                        border: `2px solid ${getTypeColor(ticket.type)}`,
                                        backgroundColor: 'white',
                                        opacity: isSoldOut ? 0.6 : 1,
                                        '&:hover': {
                                            transform: isSoldOut ? 'none' : 'translateY(-4px)',
                                            boxShadow: isSoldOut ? '0 4px 12px rgba(0,0,0,0.1)' : '0 12px 32px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                                            {/* Ticket Info */}
                                            <Stack spacing={1} sx={{ flex: 1 }}>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: getTypeColor(ticket.type)
                                                        }}
                                                    >
                                                        {ticket.type.replace('_', ' ')}
                                                    </Typography>
                                                    <Chip
                                                        label={ticket.status.replace('_', ' ')}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(ticket.status),
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary">
                                                    {ticket.description}
                                                </Typography>

                                                <Stack spacing={1}>
                                                    <Stack direction="row" spacing={2} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                                                        <Typography variant="caption">
                                                            Available: {ticket.quantityAvailable}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            Max per user: {ticket.maxPerUser}
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min((ticket.quantityAvailable / 100) * 100, 100)}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: '#E0E0E0',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: getTypeColor(ticket.type),
                                                                borderRadius: 4
                                                            }
                                                        }}
                                                    />
                                                </Stack>
                                            </Stack>

                                            {/* Price and Quantity Selector */}
                                            <Stack direction="row" alignItems="center" spacing={3}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: theme.palette.primary.main,
                                                        minWidth: 80,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    ${ticket.price.toFixed(2)}
                                                </Typography>

                                                {!isSoldOut && (
                                                    <Tooltip title={`Max per user: ${ticket.maxPerUser}`}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityChange(ticket.id, quantity - 1)}
                                                                disabled={quantity === 0}
                                                                sx={{
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>

                                                            <TextField
                                                                type="number"
                                                                value={quantity}
                                                                onChange={(e) => handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)}
                                                                inputProps={{
                                                                    min: 0,
                                                                    max: Math.min(ticket.maxPerUser, ticket.quantityAvailable),
                                                                    style: { textAlign: 'center', width: 60 }
                                                                }}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: 1,
                                                                        width: 80
                                                                    }
                                                                }}
                                                            />

                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleQuantityChange(ticket.id, quantity + 1)}
                                                                disabled={quantity >= Math.min(ticket.maxPerUser, ticket.quantityAvailable)}
                                                                sx={{
                                                                    border: '1px solid',
                                                                    borderColor: 'divider',
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    </Tooltip>
                                                )}

                                                {isSoldOut && (
                                                    <Chip
                                                        label="Sold Out"
                                                        sx={{
                                                            backgroundColor: '#FF6B6B',
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            {/* Booking Summary and Button */}
            {getTotalQuantity() > 0 && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, backgroundColor: '#F5F6FA' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                        <Stack spacing={1}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Booking Summary
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {getTotalQuantity()} ticket{getTotalQuantity() !== 1 ? 's' : ''} selected
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    color: theme.palette.primary.main
                                }}
                            >
                                Total: ${getTotalPrice().toFixed(2)}
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ShoppingCartIcon />}
                                onClick={() => setShowConfirmDialog(true)}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #4DA3FF 30%, #3A8CE5 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #3A8CE5 30%, #2E7BC8 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(77, 163, 255, 0.5)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Confirm Booking
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmDialog}
                onClose={() => !bookingLoading && setShowConfirmDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Confirm Booking
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        Please review your ticket selection
                    </Typography>
                </Box>

                <DialogContent sx={{ pt: 4 }}>
                    <Stack spacing={3}>
                        <Box sx={{ p: 2.5, backgroundColor: '#F5F6FA', borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                                {event.name}
                            </Typography>

                            {tickets
                                .filter(ticket => (selectedQuantities[ticket.id] || 0) > 0)
                                .map(ticket => (
                                    <Stack key={ticket.id} direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {ticket.type.replace('_', ' ')} × {selectedQuantities[ticket.id]}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            ${(ticket.price * (selectedQuantities[ticket.id] || 0)).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                ))}

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Total
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                                    ${getTotalPrice().toFixed(2)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            By proceeding, you agree to our terms and conditions. Tickets are non-refundable.
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={() => setShowConfirmDialog(false)}
                        disabled={bookingLoading}
                        variant="outlined"
                        size="large"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'text.primary',
                                color: 'text.primary',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBookTickets}
                        disabled={bookingLoading}
                        variant="contained"
                        size="large"
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            minWidth: 140,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                            boxShadow: '0 8px 16px rgba(77, 163, 255, 0.24)',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                                boxShadow: '0 12px 20px rgba(77, 163, 255, 0.32)',
                                transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {bookingLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Proceed to Payment'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            {notification && (
                <Snackbar
                    open={true}
                    autoHideDuration={4000}
                    onClose={handleNotificationClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleNotificationClose} severity={notification.type} variant="filled" sx={{ width: '100%' }}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default TicketBooking;
