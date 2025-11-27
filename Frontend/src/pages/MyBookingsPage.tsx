import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Grid,
    Fade,
    Stack
} from '@mui/material';
import {
    ConfirmationNumber as TicketIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { BookingService } from '../services/bookingService';
import { eventService } from '../services/eventService';
import type { Booking } from '../types/booking';
import type { Event } from '../types';
import BookingCard from '../components/booking/BookingCard';
import ETicketModal from '../components/booking/ETicketModal';
import ReceiptModal from '../components/booking/ReceiptModal';
import { generateReceiptPDF } from '../utils/pdfGenerator';

const MyBookingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [events, setEvents] = useState<Record<number, Event>>({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Dialog states
    const [cancelDialog, setCancelDialog] = useState<{
        open: boolean;
        booking: Booking | null;
    }>({ open: false, booking: null });

    const [eTicketModal, setETicketModal] = useState<{
        open: boolean;
        booking: Booking | null;
    }>({ open: false, booking: null });

    const [receiptModal, setReceiptModal] = useState<{
        open: boolean;
        booking: Booking | null;
    }>({ open: false, booking: null });

    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const userBookings = await BookingService.getUserBookings();
            setBookings(userBookings);

            // Load event details for each booking
            const eventPromises = userBookings.map(async (booking) => {
                try {
                    const event = await eventService.getEvent(booking.eventId);
                    return { id: booking.eventId, event };
                } catch (error) {
                    console.error(`Failed to load event ${booking.eventId}:`, error);
                    return null;
                }
            });

            const eventResults = await Promise.all(eventPromises);
            const eventsMap: Record<number, Event> = {};
            eventResults.forEach(result => {
                if (result) {
                    eventsMap[result.id] = result.event;
                }
            });
            setEvents(eventsMap);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            setNotification({ type: 'error', message: 'Failed to load bookings' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelDialog.booking) return;

        try {
            await BookingService.cancelBooking(cancelDialog.booking.id);
            setNotification({ type: 'success', message: 'Booking cancelled successfully' });
            setCancelDialog({ open: false, booking: null });
            loadBookings(); // Refresh bookings
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            setNotification({ type: 'error', message: 'Failed to cancel booking' });
        }
    };

    const handleCompletePayment = (booking: Booking) => {
        // Navigate to payment page with booking details
        navigate('/payment', {
            state: {
                bookingData: {
                    bookingId: booking.id,
                    price: booking.totalPrice / booking.quantity,
                    eventId: booking.eventId,
                    ticketType: booking.ticketType,
                    quantity: booking.quantity
                }
            }
        });
    };

    const handleDownloadPDF = (booking: Booking, event: Event) => {
        generateReceiptPDF(booking, event);
    };

    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'ALL') return true;
        if (filterStatus === 'CONFIRMED') return booking.status === 'CONFIRMED';
        if (filterStatus === 'CANCELLED') return booking.status === 'CANCELLED';
        if (filterStatus === 'PENDING') return booking.status === 'PENDING' || booking.paymentStatus === 'PENDING';
        return true;
    });

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: '#FFFFFF', // Soft White
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h6" sx={{ color: '#1A1C2C' }}> {/* Dark Navy */}
                    Loading your bookings...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#FFFFFF', // Soft White
            py: 6,
            px: 2
        }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: '#1A1C2C', // Dark Navy
                            mb: 2,
                            textShadow: 'none'
                        }}
                    >
                        My Bookings
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#6E7687', fontWeight: 400 }}> {/* Cool Gray */}
                        Manage your tickets and upcoming events
                    </Typography>
                </Box>

                {/* Filters */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        {['ALL', 'CONFIRMED', 'CANCELLED', 'PENDING'].map((status) => (
                            <Button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                variant={filterStatus === status ? 'contained' : 'text'}
                                sx={{
                                    borderRadius: 50,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'capitalize',
                                    fontWeight: 600,
                                    bgcolor: filterStatus === status ? '#2D4EC8' : 'transparent', // Royal Blue
                                    color: filterStatus === status ? '#FFFFFF' : '#6E7687', // Cool Gray
                                    '&:hover': {
                                        bgcolor: filterStatus === status ? '#3B63E6' : 'rgba(0,0,0,0.05)' // Ocean Blue
                                    }
                                }}
                            >
                                {status.toLowerCase().replace('_', ' ')}
                            </Button>
                        ))}
                    </Stack>
                </Box>

                {filteredBookings.length === 0 ? (
                    <Fade in>
                        <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#F5F7FB', borderRadius: 4 }}> {/* Light Gray Blue */}
                            <TicketIcon sx={{ fontSize: 80, color: '#D6DAE2', mb: 2 }} /> {/* Subtle Divider color for icon */}
                            <Typography variant="h5" sx={{ color: '#1A1C2C', mb: 1 }}>
                                No bookings found
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6E7687' }}>
                                {filterStatus === 'ALL'
                                    ? "You haven't made any bookings yet. Start exploring events!"
                                    : `No ${filterStatus.toLowerCase()} bookings found.`}
                            </Typography>
                        </Box>
                    </Fade>
                ) : (
                    <Grid container spacing={3}>
                        {filteredBookings.map((booking) => (
                            <Grid size={{ xs: 12 }} key={booking.id}>
                                <BookingCard
                                    booking={booking}
                                    event={events[booking.eventId]}
                                    onViewETicket={(b) => setETicketModal({ open: true, booking: b })}
                                    onCancelBooking={(b) => setCancelDialog({ open: true, booking: b })}
                                    onCompletePayment={handleCompletePayment}
                                    onViewReceipt={(b) => setReceiptModal({ open: true, booking: b })}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Cancel Confirmation Dialog */}
                <Dialog
                    open={cancelDialog.open}
                    onClose={() => setCancelDialog({ open: false, booking: null })}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }
                    }}
                >
                    <DialogTitle>Cancel Booking</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </Typography>
                        {cancelDialog.booking && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Booking: {cancelDialog.booking.bookingRef}
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialog({ open: false, booking: null })}>
                            Keep Booking
                        </Button>
                        <Button onClick={handleCancelBooking} color="error" variant="contained">
                            Cancel Booking
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* E-Ticket Modal */}
                <ETicketModal
                    open={eTicketModal.open}
                    onClose={() => setETicketModal({ open: false, booking: null })}
                    booking={eTicketModal.booking}
                    event={eTicketModal.booking ? events[eTicketModal.booking.eventId] : null}
                />

                {/* Receipt Modal */}
                <ReceiptModal
                    open={receiptModal.open}
                    onClose={() => setReceiptModal({ open: false, booking: null })}
                    booking={receiptModal.booking}
                    event={receiptModal.booking ? events[receiptModal.booking.eventId] : null}
                    onDownloadPDF={handleDownloadPDF}
                />

                {/* Notifications */}
                {notification && (
                    <Snackbar
                        open={true}
                        autoHideDuration={4000}
                        onClose={() => setNotification(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={() => setNotification(null)}
                            severity={notification.type}
                            sx={{ width: '100%', borderRadius: 2 }}
                            icon={notification.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                )}
            </Container>
        </Box>
    );
};

export default MyBookingsPage;