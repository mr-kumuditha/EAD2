import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Download as DownloadIcon,
    Print as PrintIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import { BookingService } from '../services/bookingService';
import { eventService } from '../services/eventService';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import type { Booking } from '../types/booking';
import type { Event } from '../types';

const BookingDetailsPage: React.FC = () => {
    const { bookingRef } = useParams<{ bookingRef: string }>();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (bookingRef) {
            loadBookingDetails();
        }
    }, [bookingRef]);

    const loadBookingDetails = async () => {
        try {
            if (!bookingRef || bookingRef === 'undefined') {
                throw new Error('Invalid booking reference');
            }

            let bookingData;
            if (/^\d+$/.test(bookingRef)) {
                bookingData = await BookingService.getBookingById(parseInt(bookingRef));
            } else {
                bookingData = await BookingService.getBookingByRef(bookingRef);
            }

            setBooking(bookingData);
            const eventData = await eventService.getEvent(bookingData.eventId);
            setEvent(eventData);
        } catch (err) {
            console.error('Failed to load booking details:', err);
            setError('Failed to load booking details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        if (booking && event) {
            generateReceiptPDF(booking, event);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !booking || !event) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>{error || 'Booking not found'}</Alert>
                <Button onClick={() => navigate('/events')}>
                    Back to Events
                </Button>
            </Container>
        );
    }

    // Calculated values for display
    const fees = booking.totalPrice * 0.08; // Estimated 8% tax/fees
    const totalAmount = booking.totalPrice + fees;

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F7FA', py: 6 }}>
            <Container maxWidth="md">
                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    {/* Header */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0056D2', mb: 0.5 }}>
                                Booking Confirmation
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Thank you for your purchase!
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadPDF}
                                sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#E0E0E0', color: '#0056D2', bgcolor: '#F0F6FF', border: 'none', '&:hover': { bgcolor: '#E1E9F5', border: 'none' } }}
                            >
                                Download as PDF
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PrintIcon />}
                                onClick={handlePrint}
                                sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#0056D2', '&:hover': { bgcolor: '#0044A5' } }}
                            >
                                Print Receipt
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ mb: 4 }} />

                    {/* Transaction Info Grid */}
                    <Grid container spacing={4} sx={{ mb: 5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">{booking.bookingRef}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Booking Date</Typography>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Attendee</Typography>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">Alex Johnson</Typography>
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">Visa ending in **** 1234</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <CheckCircleIcon sx={{ fontSize: 16, color: '#2E7D32' }} />
                                        <Typography variant="body2" fontWeight={600} color="#2E7D32">Paid</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 4 }} />

                    {/* Event Details */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Event Details</Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={3}>
                            <Stack spacing={1.5} sx={{ flex: 1 }}>
                                <Grid container>
                                    <Grid size={{ xs: 3 }}>
                                        <Typography variant="body2" color="text.secondary">Event:</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 9 }}>
                                        <Typography variant="body2" fontWeight={600}>{event.name}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Grid size={{ xs: 3 }}>
                                        <Typography variant="body2" color="text.secondary">Date & Time:</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 9 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container>
                                    <Grid size={{ xs: 3 }}>
                                        <Typography variant="body2" color="text.secondary">Venue:</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 9 }}>
                                        <Typography variant="body2" fontWeight={600}>{event.location}</Typography>
                                    </Grid>
                                </Grid>
                            </Stack>
                            <Box sx={{
                                p: 2,
                                bgcolor: '#1A3B35', // Dark green/teal background from mockup
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 0.5 }}>
                                    <QRCodeCanvas
                                        value={JSON.stringify({ ref: booking.bookingRef, id: booking.id })}
                                        size={80}
                                        level="H"
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Ticket Information */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ticket Information</Typography>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }} aria-label="ticket table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid #E0E0E0' }}>Ticket Type</TableCell>
                                        <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid #E0E0E0' }}>Quantity</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid #E0E0E0' }}>Price</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 500, borderBottom: '1px solid #E0E0E0' }}>Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                                            {booking.ticketType.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell align="center">{booking.quantity}</TableCell>
                                        <TableCell align="right">${(booking.totalPrice / booking.quantity).toFixed(2)}</TableCell>
                                        <TableCell align="right">${booking.totalPrice.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Summary */}
                    <Stack alignItems="flex-end" spacing={1} sx={{ mb: 6 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ width: { xs: '100%', sm: 300 } }}>
                            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                            <Typography variant="body2" fontWeight={600}>${booking.totalPrice.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ width: { xs: '100%', sm: 300 } }}>
                            <Typography variant="body2" color="text.secondary">Fees & Taxes</Typography>
                            <Typography variant="body2" fontWeight={600}>${fees.toFixed(2)}</Typography>
                        </Stack>
                        <Divider sx={{ width: { xs: '100%', sm: 300 }, my: 1 }} />
                        <Stack direction="row" justifyContent="space-between" sx={{ width: { xs: '100%', sm: 300 } }}>
                            <Typography variant="h6" fontWeight={800}>Total Amount Paid</Typography>
                            <Typography variant="h6" fontWeight={800} color="#0056D2">${totalAmount.toFixed(2)}</Typography>
                        </Stack>
                    </Stack>

                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            onClick={() => navigate('/bookings')}
                            sx={{ color: '#0056D2', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                        >
                            Go to My Bookings
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default BookingDetailsPage;