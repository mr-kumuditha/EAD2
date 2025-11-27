import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Alert,
    Snackbar,
    useTheme,
    IconButton,
    InputAdornment,
    Card,
    CardContent
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    CheckCircle as ConfirmIcon,
    Cancel as CancelIcon,
    Undo as RefundIcon,
    Event as EventIcon,
    Person as PersonIcon,
    ConfirmationNumber as TicketIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { BookingService } from '../services/bookingService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import type { Booking } from '../types/booking';
import type { Event } from '../types';
import type { User } from '../types';

const AdminBookingsPage: React.FC = () => {
    const theme = useTheme();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [events, setEvents] = useState<Record<number, Event>>({});
    const [users, setUsers] = useState<Record<number, User>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');
    const [eventFilter, setEventFilter] = useState<string>('ALL');
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        action: 'confirm' | 'cancel' | 'refund' | null;
        booking: Booking | null;
    }>({ open: false, action: null, booking: null });
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [bookings, searchTerm, bookingStatusFilter, paymentStatusFilter, eventFilter]);

    const loadBookings = async () => {
        try {
            const allBookings = await BookingService.getAllBookings();
            setBookings(allBookings);

            // Load related data
            const eventPromises = allBookings.map(async (booking) => {
                try {
                    const event = await eventService.getEvent(booking.eventId);
                    return { id: booking.eventId, event };
                } catch (error) {
                    console.error(`Failed to load event ${booking.eventId}:`, error);
                    return null;
                }
            });

            // Load all users
            const allUsers = await userService.getAllUsers();
            const usersMap: Record<number, User> = {};
            allUsers.forEach(user => {
                usersMap[user.userId] = user;
            });
            setUsers(usersMap);

            const eventResults = await Promise.all(eventPromises);

            const eventsMap: Record<number, Event> = {};
            eventResults.forEach(result => {
                if (result) eventsMap[result.id] = result.event;
            });

            setEvents(eventsMap);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            setNotification({ type: 'error', message: 'Failed to load bookings' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = bookings;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                events[booking.eventId]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                users[booking.userId]?.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Booking status filter
        if (bookingStatusFilter !== 'ALL') {
            filtered = filtered.filter(booking => booking.status === bookingStatusFilter);
        }

        // Payment status filter
        if (paymentStatusFilter !== 'ALL') {
            filtered = filtered.filter(booking => booking.paymentStatus === paymentStatusFilter);
        }

        // Event filter
        if (eventFilter !== 'ALL') {
            filtered = filtered.filter(booking => booking.eventId === parseInt(eventFilter));
        }

        setFilteredBookings(filtered);
    };

    const handleAction = async () => {
        if (!actionDialog.booking || !actionDialog.action) return;

        try {
            let result;
            switch (actionDialog.action) {
                case 'confirm':
                    result = await BookingService.confirmBooking(actionDialog.booking.id);
                    break;
                case 'cancel':
                    result = await BookingService.cancelBooking(actionDialog.booking.id);
                    break;
                case 'refund':
                    result = await BookingService.refundBooking(actionDialog.booking.id);
                    break;
            }

            setNotification({
                type: 'success',
                message: `${actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1)} successful`
            });
            setActionDialog({ open: false, action: null, booking: null });
            loadBookings(); // Refresh data
        } catch (error) {
            console.error(`${actionDialog.action} failed:`, error);
            setNotification({
                type: 'error',
                message: `Failed to ${actionDialog.action} booking`
            });
        }
    };

    const getBookingStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'CONFIRMED': return '#4CAF50';
            case 'CANCELLED': return '#F44336';
            case 'EXPIRED': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
        switch (status) {
            case 'PENDING': return '#FF9800';
            case 'COMPLETED': return '#4CAF50';
            case 'FAILED': return '#F44336';
            case 'REFUNDED': return '#9C27B0';
            default: return '#9E9E9E';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'EARLY_BIRD': return '#FF6B6B';
            case 'STANDARD': return '#4DA3FF';
            case 'VIP': return '#FFD93D';
            default: return '#9E9E9E';
        }
    };

    const canConfirm = (booking: Booking) => booking.status === 'PENDING';
    const canCancel = (booking: Booking) => ['PENDING', 'CONFIRMED'].includes(booking.status);
    const canRefund = (booking: Booking) => booking.paymentStatus === 'COMPLETED';

    const uniqueEvents = Array.from(new Set(bookings.map(b => b.eventId)))
        .map(eventId => ({ id: eventId, name: events[eventId]?.name || `Event ${eventId}` }));

    if (loading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0B1020 0%, #1a1f35 50%, #0B1020 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h6" sx={{ color: '#E6F0FF' }}>
                    Loading bookings...
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
            <Container maxWidth="xl">
                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        fontWeight: 700,
                        color: '#E6F0FF',
                        textAlign: 'center'
                    }}
                >
                    Admin Booking Dashboard
                </Typography>

                {/* Filters */}
                <Card sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.95)'
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Filters
                        </Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                placeholder="Search by booking ref, event, or user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ minWidth: 250 }}
                            />
                            <TextField
                                select
                                label="Booking Status"
                                value={bookingStatusFilter}
                                onChange={(e) => setBookingStatusFilter(e.target.value)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                <MenuItem value="EXPIRED">Expired</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Payment Status"
                                value={paymentStatusFilter}
                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="FAILED">Failed</MenuItem>
                                <MenuItem value="REFUNDED">Refunded</MenuItem>
                            </TextField>
                            <TextField
                                select
                                label="Event"
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value)}
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="ALL">All Events</MenuItem>
                                {uniqueEvents.map(event => (
                                    <MenuItem key={event.id} value={event.id.toString()}>
                                        {event.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        '& .MuiTableHead-root': {
                            backgroundColor: theme.palette.primary.main,
                            '& .MuiTableCell-head': {
                                color: 'white',
                                fontWeight: 600
                            }
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Booking Ref</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Ticket Type</TableCell>
                                <TableCell align="center">Quantity</TableCell>
                                <TableCell align="center">Booking Status</TableCell>
                                <TableCell align="center">Payment Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings.map((booking) => {
                                const event = events[booking.eventId];
                                const user = users[booking.userId];
                                return (
                                    <TableRow
                                        key={booking.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'rgba(77, 163, 255, 0.05)',
                                                transform: 'scale(1.01)',
                                                transition: 'all 0.2s ease'
                                            },
                                            animation: booking.status === 'PENDING' ? 'pulse 2s infinite' : 'none'
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {booking.bookingRef}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon sx={{ color: '#666', fontSize: '1rem' }} />
                                                <Typography variant="body2">
                                                    {user?.username || `User ${booking.userId}`}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EventIcon sx={{ color: '#666', fontSize: '1rem' }} />
                                                <Typography variant="body2">
                                                    {event?.name || `Event ${booking.eventId}`}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.ticketType}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getTypeColor(booking.ticketType),
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {booking.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getBookingStatusColor(booking.status),
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={booking.paymentStatus}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getPaymentStatusColor(booking.paymentStatus),
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                {canConfirm(booking) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setActionDialog({
                                                            open: true,
                                                            action: 'confirm',
                                                            booking
                                                        })}
                                                        sx={{
                                                            color: '#4CAF50',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <ConfirmIcon />
                                                    </IconButton>
                                                )}
                                                {canCancel(booking) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setActionDialog({
                                                            open: true,
                                                            action: 'cancel',
                                                            booking
                                                        })}
                                                        sx={{
                                                            color: '#F44336',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                )}
                                                {canRefund(booking) && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setActionDialog({
                                                            open: true,
                                                            action: 'refund',
                                                            booking
                                                        })}
                                                        sx={{
                                                            color: '#9C27B0',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <RefundIcon />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredBookings.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <TicketIcon sx={{ fontSize: 80, color: '#4DA3FF', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#E6F0FF', mb: 2 }}>
                            No bookings found
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#B0B7C3' }}>
                            Try adjusting your filters to see more results.
                        </Typography>
                    </Box>
                )}

                {/* Action Confirmation Dialog */}
                <Dialog
                    open={actionDialog.open}
                    onClose={() => setActionDialog({ open: false, action: null, booking: null })}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }
                    }}
                >
                    <DialogTitle>
                        Confirm Action
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {actionDialog.action} this booking?
                        </Typography>
                        {actionDialog.booking && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Booking: {actionDialog.booking.bookingRef}
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setActionDialog({ open: false, action: null, booking: null })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            variant="contained"
                            color={actionDialog.action === 'confirm' ? 'success' :
                                actionDialog.action === 'cancel' ? 'error' : 'secondary'}
                        >
                            {actionDialog.action?.charAt(0).toUpperCase()}{actionDialog.action?.slice(1)}
                        </Button>
                    </DialogActions>
                </Dialog>

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
                            icon={notification.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                        >
                            {notification.message}
                        </Alert>
                    </Snackbar>
                )}
            </Container>

        </Box>
    );
};

export default AdminBookingsPage;
