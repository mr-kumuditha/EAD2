import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    TextField,
    useTheme,
    Alert,
    Snackbar,
    LinearProgress,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    IconButton
} from '@mui/material';
import {
    CreditCard as CreditCardIcon,
    Lock as LockIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    CalendarToday as DateIcon,
    Place as PlaceIcon
} from '@mui/icons-material';

import { eventService } from '../services/eventService';
import { BookingService } from '../services/bookingService';
import type { Event } from '../types';

interface PaymentFormData {
    cardName: string;
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

interface BookingData {
    eventId: number;
    ticketType: string;
    quantity: number;
    price: number;
    bookingId?: number;
}

const PaymentPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [event, setEvent] = useState<Event | null>(null);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [formData, setFormData] = useState<PaymentFormData>({
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    // Fees
    const SERVICE_FEE = 2.50;
    const PROCESSING_FEE = 1.00;

    useEffect(() => {
        const state = location.state as { bookingData?: BookingData };
        if (state?.bookingData) {
            if (!state.bookingData.bookingId) {
                console.error('Booking ID is missing in state:', state.bookingData);
                setNotification({ type: 'error', message: 'Invalid booking data. Please try again.' });
                setTimeout(() => navigate('/events'), 2000);
                return;
            }
            setBookingData(state.bookingData);
            loadEvent(state.bookingData.eventId);
        } else {
            navigate('/events');
        }
    }, [location.state, navigate]);

    const loadEvent = async (eventId: number) => {
        try {
            const eventData = await eventService.getEvent(eventId);
            setEvent(eventData);
        } catch (error) {
            console.error('Failed to load event:', error);
            setNotification({ type: 'error', message: 'Failed to load event details' });
        }
    };

    const handleInputChange = (field: keyof PaymentFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.cardName.trim()) {
            setNotification({ type: 'error', message: 'Card name is required' });
            return false;
        }

        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cardNumber)) {
            setNotification({ type: 'error', message: 'Please enter a valid 16-digit card number' });
            return false;
        }

        if (!formData.expiryMonth || !formData.expiryYear) {
            setNotification({ type: 'error', message: 'Expiry date is required' });
            return false;
        }

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const expiryYear = parseInt(formData.expiryYear);
        const expiryMonth = parseInt(formData.expiryMonth);

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            setNotification({ type: 'error', message: 'Card has expired' });
            return false;
        }

        if (!/^\d{3,4}$/.test(formData.cvv)) {
            setNotification({ type: 'error', message: 'Please enter a valid CVV' });
            return false;
        }

        return true;
    };

    const handlePayment = async () => {
        if (!bookingData || !validateForm()) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const paymentData = {
                paymentMethod: 'CREDIT_CARD',
                transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            const response = await BookingService.confirmPayment(bookingData.bookingId!, paymentData);

            if (response.status === 'CONFIRMED') {
                setNotification({ type: 'success', message: 'Payment successful! Redirecting...' });
                setTimeout(() => {
                    navigate(`/my-bookings/${bookingData.bookingId}`);
                }, 1500);
            } else {
                throw new Error(response.message || 'Payment failed');
            }
        } catch (error: any) {
            console.error('Payment failed:', error);
            const responseData = error.response?.data;
            let errorMessage = 'Payment failed. Please try again.';

            if (typeof responseData === 'string') {
                errorMessage = responseData;
            } else if (responseData && typeof responseData === 'object') {
                errorMessage = responseData.message || responseData.error || JSON.stringify(responseData);
            } else {
                errorMessage = error.message || errorMessage;
            }

            if (errorMessage.includes('CONFIRMED')) {
                setNotification({ type: 'success', message: 'Booking is already confirmed!' });
                setTimeout(() => navigate('/bookings'), 2000);
                setLoading(false);
                return;
            }
            if (errorMessage.includes('expired')) {
                setNotification({ type: 'error', message: 'Booking has expired. Please create a new booking.' });
                setTimeout(() => navigate('/events'), 2000);
                setLoading(false);
                return;
            }

            setNotification({ type: 'error', message: errorMessage });
            setLoading(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(event.target.value);
        setFormData(prev => ({
            ...prev,
            cardNumber: formatted
        }));
    };

    const getSubtotal = () => {
        return bookingData ? bookingData.price * bookingData.quantity : 0;
    };

    const getTotalPrice = () => {
        return getSubtotal() + SERVICE_FEE + PROCESSING_FEE;
    };

    if (!bookingData || !event) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <LinearProgress sx={{ width: '50%' }} />
            </Box>
        );
    }

    return (
        <>
            {/* Header */}
            <Box sx={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E5E7EB',
                py: 2.5,
                px: 3
            }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Box sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: '3px solid white'
                                }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                                EventHub
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LockIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                Secure Checkout
                            </Typography>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Main Content */}
            <Box sx={{
                minHeight: 'calc(100vh - 72px)',
                backgroundColor: '#F9FAFB',
                py: { xs: 4, md: 6 },
                px: 2
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center">
                        {/* Left Column: Payment Form */}
                        <Grid size={{ xs: 12, md: 7, lg: 6 }}>
                            <Box>
                                <Typography variant="h4" sx={{
                                    fontWeight: 800,
                                    color: '#1F2937',
                                    mb: 2.5,
                                    fontSize: { xs: '1.75rem', md: '2rem' }
                                }}>
                                    Complete Your Payment
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 5 }}>
                                    <Typography variant="body1" sx={{ color: '#6B7280', fontSize: '1rem' }}>
                                        Pay with Credit Card
                                    </Typography>
                                    <Stack direction="row" spacing={0.75}>
                                        <Box sx={{
                                            width: 38,
                                            height: 26,
                                            bgcolor: '#1A1F71',
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            letterSpacing: 0.5
                                        }}>
                                            VISA
                                        </Box>
                                        <Box sx={{
                                            width: 38,
                                            height: 26,
                                            background: 'linear-gradient(90deg, #EB001B 50%, #F79E1B 50%)',
                                            borderRadius: 1,
                                            position: 'relative'
                                        }} />
                                    </Stack>
                                </Stack>

                                <Stack spacing={3.5}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{
                                            mb: 1.5,
                                            fontWeight: 600,
                                            color: '#374151',
                                            fontSize: '0.875rem'
                                        }}>
                                            Card Number
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={formData.cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="0000 0000 0000 0000"
                                            inputProps={{ maxLength: 19 }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CreditCardIcon sx={{ color: '#9CA3AF' }} />
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    backgroundColor: 'white',
                                                    fontSize: '1rem',
                                                    '& fieldset': {
                                                        borderColor: '#E5E7EB'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#D1D5DB'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#2563EB',
                                                        borderWidth: 1.5
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" sx={{
                                            mb: 1.5,
                                            fontWeight: 600,
                                            color: '#374151',
                                            fontSize: '0.875rem'
                                        }}>
                                            Name on Card
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            value={formData.cardName}
                                            onChange={handleInputChange('cardName')}
                                            placeholder="John Doe"
                                            InputProps={{
                                                sx: {
                                                    borderRadius: 2,
                                                    backgroundColor: 'white',
                                                    fontSize: '1rem',
                                                    '& fieldset': {
                                                        borderColor: '#E5E7EB'
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: '#D1D5DB'
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#2563EB',
                                                        borderWidth: 1.5
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 7 }}>
                                            <Typography variant="subtitle2" sx={{
                                                mb: 1.5,
                                                fontWeight: 600,
                                                color: '#374151',
                                                fontSize: '0.875rem'
                                            }}>
                                                Expiration Date (MM/YY)
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                value={formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth} / ${formData.expiryYear}` : formData.expiryMonth || ''}
                                                onChange={(e) => {
                                                    // Remove all non-digits
                                                    const value = e.target.value.replace(/\D/g, '');

                                                    // Extract month and year
                                                    const month = value.substring(0, 2);
                                                    const year = value.substring(2, 4);

                                                    setFormData(prev => ({
                                                        ...prev,
                                                        expiryMonth: month,
                                                        expiryYear: year
                                                    }));
                                                }}
                                                placeholder="MM / YY"
                                                inputProps={{ maxLength: 7 }}
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: 2,
                                                        backgroundColor: 'white',
                                                        fontSize: '1rem',
                                                        '& fieldset': {
                                                            borderColor: '#E5E7EB'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#D1D5DB'
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#2563EB',
                                                            borderWidth: 1.5
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 5 }}>
                                            <Typography variant="subtitle2" sx={{
                                                mb: 1.5,
                                                fontWeight: 600,
                                                color: '#374151',
                                                fontSize: '0.875rem'
                                            }}>
                                                CVV
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                value={formData.cvv}
                                                onChange={handleInputChange('cvv')}
                                                type="password"
                                                placeholder="123"
                                                inputProps={{ maxLength: 4 }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Box sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                bgcolor: '#E5E7EB',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                color: '#6B7280'
                                                            }}>
                                                                ?
                                                            </Box>
                                                        </InputAdornment>
                                                    ),
                                                    sx: {
                                                        borderRadius: 2,
                                                        backgroundColor: 'white',
                                                        fontSize: '1rem',
                                                        '& fieldset': {
                                                            borderColor: '#E5E7EB'
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: '#D1D5DB'
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#2563EB',
                                                            borderWidth: 1.5
                                                        }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Right Column: Order Summary */}
                        <Grid size={{ xs: 12, md: 5, lg: 5 }}>
                            <Card sx={{
                                borderRadius: 3,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #E5E7EB',
                                overflow: 'hidden'
                            }}>
                                <CardContent sx={{ p: 0 }}>
                                    {/* Order Summary Header */}
                                    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: '#1F2937',
                                            fontSize: '1.125rem'
                                        }}>
                                            Order Summary
                                        </Typography>
                                    </Box>

                                    {/* Event Image */}
                                    {event.imageUrl && (
                                        <Box sx={{ px: 3, pb: 2 }}>
                                            <Box
                                                component="img"
                                                src={event.imageUrl}
                                                alt={event.name}
                                                sx={{
                                                    width: '100%',
                                                    height: 180,
                                                    objectFit: 'cover',
                                                    borderRadius: 2
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Box sx={{ px: 3, pb: 3 }}>
                                        {/* Event Details */}
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            mb: 2,
                                            color: '#1F2937',
                                            fontSize: '1rem',
                                            lineHeight: 1.4
                                        }}>
                                            {event.name}
                                        </Typography>

                                        <Stack spacing={1.5} sx={{ mb: 3.5 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                <DateIcon sx={{ fontSize: 18, color: '#6B7280', mt: 0.25 }} />
                                                <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                                    {new Date(event.date).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}, {new Date(event.date).toLocaleTimeString(undefined, {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                <PlaceIcon sx={{ fontSize: 18, color: '#6B7280', mt: 0.25 }} />
                                                <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                                    {event.location}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        {/* Price Breakdown */}
                                        <Stack spacing={2}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                                    {bookingData.ticketType.replace('_', ' ')} ({bookingData.quantity} × ${bookingData.price.toFixed(2)})
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                                    ${getSubtotal().toFixed(2)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                                    Service Fee
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                                    ${SERVICE_FEE.toFixed(2)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                                    Processing Fee
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
                                                    ${PROCESSING_FEE.toFixed(2)}
                                                </Typography>
                                            </Stack>

                                            <Divider sx={{ my: 1.5, borderColor: '#E5E7EB' }} />

                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '1rem' }}>
                                                    Total
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2937', fontSize: '1.5rem' }}>
                                                    ${getTotalPrice().toFixed(2)}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        {/* Pay Button */}
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={handlePayment}
                                            disabled={loading}
                                            sx={{
                                                mt: 3,
                                                py: 1.75,
                                                borderRadius: 2,
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                backgroundColor: '#2563EB',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    backgroundColor: '#1E40AF',
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            {loading ? 'Processing...' : `Pay $${getTotalPrice().toFixed(2)}`}
                                        </Button>

                                        {/* Security Text */}
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent="center"
                                            sx={{ mt: 2.5 }}
                                        >
                                            <LockIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                                Your payment is securely processed.
                                            </Typography>
                                        </Stack>

                                        {/* Terms */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'center',
                                                color: '#9CA3AF',
                                                fontSize: '0.7rem',
                                                mt: 2,
                                                lineHeight: 1.5
                                            }}
                                        >
                                            By completing your purchase, you agree to our{' '}
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: '#2563EB',
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Terms of Service
                                            </Box>
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

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
                        variant="filled"
                        sx={{ width: '100%', borderRadius: 2 }}
                        icon={notification.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </>
    );
};

export default PaymentPage;
