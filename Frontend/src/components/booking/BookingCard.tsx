import React from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Chip,
    Button,
    Stack,
    Grid,
    alpha
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    CalendarToday as CalendarIcon,
    Receipt as ReceiptIcon,
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Cancel as CancelIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import type { Booking } from '../../types/booking';
import type { Event } from '../../types';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

interface BookingCardProps {
    booking: Booking;
    event?: Event;
    onViewETicket: (booking: Booking) => void;
    onCancelBooking?: (booking: Booking) => void;
    onCompletePayment?: (booking: Booking) => void;
    onViewReceipt?: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    event,
    onViewETicket,
    onCancelBooking,
    onCompletePayment,
    onViewReceipt
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return '#2ECC71'; // Emerald Green
            case 'COMPLETED': return '#2ECC71';
            case 'PENDING': return '#F5C044'; // Gold Accent
            case 'CANCELLED': return '#E63946'; // Crimson Red
            case 'FAILED': return '#E63946';
            case 'EXPIRED': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Date not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadPDF = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!event) return;
        generateReceiptPDF(booking, event);
    };

    return (
        <Card
            sx={{
                borderRadius: 4,
                background: '#F5F7FB', // Card Background: Light Gray Blue
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)', // Card Shadow
                transition: 'all 0.3s ease',
                border: '1px solid #E9ECF2', // Border
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)', // Hover Shadow
                    borderColor: '#D6DAE2' // Subtle Divider
                },
                position: 'relative',
                overflow: 'visible'
            }}
        >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Grid container spacing={3}>
                    {/* Left: Image */}
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                minHeight: 160,
                                borderRadius: 3,
                                backgroundImage: `url(${event?.imageUrl || '/placeholder-event.jpg'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                            }}
                        />
                    </Grid>

                    {/* Middle: Info */}
                    <Grid size={{ xs: 12, sm: 8, md: 6 }}>
                        <Stack spacing={1.5} height="100%" justifyContent="center">
                            {/* Status Chips */}
                            <Stack direction="row" spacing={1}>
                                <Chip
                                    label={booking.status}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(getStatusColor(booking.status), 0.1),
                                        color: getStatusColor(booking.status),
                                        fontWeight: 700,
                                        borderRadius: 1,
                                        height: 24,
                                        border: `1px solid ${alpha(getStatusColor(booking.status), 0.2)}`
                                    }}
                                />
                                <Chip
                                    label={booking.paymentStatus}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(getStatusColor(booking.paymentStatus), 0.1),
                                        color: getStatusColor(booking.paymentStatus),
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        height: 24
                                    }}
                                />
                            </Stack>

                            {/* Event Name */}
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1C2C', lineHeight: 1.2 }}> {/* Primary Text */}
                                {event?.name || 'Loading Event...'}
                            </Typography>

                            {/* Date & Location */}
                            <Stack spacing={0.5} sx={{ color: '#6E7687' }}> {/* Secondary Text */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon sx={{ fontSize: 16, color: '#F5C044' }} /> {/* Gold Accent */}
                                    <Typography variant="body2">
                                        {formatDate(event?.date)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationIcon sx={{ fontSize: 16, color: '#F5C044' }} /> {/* Gold Accent */}
                                    <Typography variant="body2">
                                        {event?.location || 'Location TBA'}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Booking Details (Bottom) */}
                            <Box sx={{ pt: 1, mt: 'auto' }}>
                                <Typography variant="caption" display="block" sx={{ color: '#6E7687', fontFamily: 'monospace' }}>
                                    Booking ID: <Box component="span" sx={{ color: '#1A1C2C', fontWeight: 600 }}>#{booking.bookingRef}</Box>
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ color: '#6E7687' }}>
                                    Ticket: <Box component="span" sx={{ color: '#1A1C2C', fontWeight: 600 }}>{booking.quantity} x {booking.ticketType}</Box>
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Right: Actions */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
                        {booking.status === 'CONFIRMED' && (
                            <Button
                                variant="contained"
                                startIcon={<VisibilityIcon />}
                                onClick={() => onViewETicket(booking)}
                                fullWidth
                                sx={{
                                    bgcolor: '#2D4EC8', // Royal Blue
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1,
                                    boxShadow: '0 4px 12px rgba(45, 78, 200, 0.2)',
                                    '&:hover': {
                                        bgcolor: '#3B63E6', // Ocean Blue
                                        boxShadow: '0 6px 16px rgba(59, 99, 230, 0.3)'
                                    }
                                }}
                            >
                                View E-Ticket
                            </Button>
                        )}

                        {booking.status === 'PENDING' && (
                            <Button
                                variant="contained"
                                startIcon={<PaymentIcon />}
                                onClick={() => onCompletePayment && onCompletePayment(booking)}
                                fullWidth
                                sx={{
                                    bgcolor: '#F5C044', // Gold Accent
                                    color: '#1A1C2C',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1,
                                    '&:hover': {
                                        bgcolor: '#E0B03E'
                                    }
                                }}
                            >
                                Complete Payment
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPDF}
                            fullWidth
                            sx={{
                                borderColor: '#D6DAE2',
                                color: '#2ECC71', // Emerald Green for download
                                borderRadius: 2,
                                textTransform: 'none',
                                bgcolor: '#FFFFFF',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#2ECC71',
                                    bgcolor: alpha('#2ECC71', 0.05)
                                }
                            }}
                        >
                            Download
                        </Button>

                        {onCancelBooking && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') ? (
                            <Button
                                startIcon={<CancelIcon />}
                                onClick={() => onCancelBooking(booking)}
                                fullWidth
                                sx={{
                                    color: '#6E7687',
                                    textTransform: 'none',
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    '&:hover': {
                                        color: '#E63946', // Crimson Red
                                        bgcolor: 'transparent'
                                    }
                                }}
                            >
                                Cancel Booking
                            </Button>
                        ) : (
                            <Button
                                startIcon={<ReceiptIcon />}
                                onClick={() => onViewReceipt && onViewReceipt(booking)}
                                fullWidth
                                sx={{
                                    color: '#6E7687',
                                    textTransform: 'none',
                                    justifyContent: 'flex-start',
                                    px: 2,
                                    '&:hover': {
                                        color: '#2D4EC8',
                                        bgcolor: 'transparent'
                                    }
                                }}
                            >
                                View Receipt
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BookingCard;
