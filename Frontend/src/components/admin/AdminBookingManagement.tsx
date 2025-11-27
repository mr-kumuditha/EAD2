import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    MenuItem,
    Stack,
    TablePagination,
    Tooltip,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Receipt as ReceiptIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { userService } from '../../services/userService';
import type { Booking } from '../../types/booking';
import type { Event, User } from '../../types';

const AdminBookingManagement: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [events, setEvents] = useState<Record<number, Event>>({});
    const [users, setUsers] = useState<Record<number, User>>({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [eventFilter, setEventFilter] = useState('ALL');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [bookings, searchTerm, statusFilter, eventFilter, users]);

    const loadData = async () => {
        try {
            const [allBookings, allEvents, allUsers] = await Promise.all([
                BookingService.getAllBookings(),
                eventService.getAllEvents(),
                userService.getAllUsers()
            ]);

            setBookings(Array.isArray(allBookings) ? allBookings : []);

            const eventsMap: Record<number, Event> = {};
            if (Array.isArray(allEvents)) {
                allEvents.forEach(e => eventsMap[e.id] = e);
            }
            setEvents(eventsMap);

            const usersMap: Record<number, User> = {};
            if (Array.isArray(allUsers)) {
                allUsers.forEach(u => usersMap[u.userId] = u);
            }
            setUsers(usersMap);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = bookings;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(b =>
                (b.bookingRef || '').toLowerCase().includes(lowerTerm) ||
                (users[b.userId]?.username || '').toLowerCase().includes(lowerTerm) ||
                (users[b.userId]?.email || '').toLowerCase().includes(lowerTerm)
            );
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(b => b.status === statusFilter);
        }

        if (eventFilter !== 'ALL') {
            result = result.filter(b => b.eventId === parseInt(eventFilter));
        }

        setFilteredBookings(result);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'error';
            case 'EXPIRED': return 'default';
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'error';
            case 'REFUNDED': return 'secondary';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    const uniqueEvents = Array.from(new Set(bookings.map(b => b.eventId)))
        .map(id => events[id]).filter(Boolean);

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Booking Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    View and manage all user bookings in real-time.
                </Typography>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by Booking ID, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                        }}
                        sx={{ flex: 1 }}
                        size="small"
                    />
                    <TextField
                        select
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="ALL">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Event"
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        sx={{ minWidth: 200 }}
                        size="small"
                    >
                        <MenuItem value="ALL">All Events</MenuItem>
                        {uniqueEvents.map(event => (
                            <MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Booking ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Event</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Ticket Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Qty</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Total Price</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((booking) => (
                                    <TableRow
                                        key={booking.id}
                                        hover
                                        sx={{
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                            {booking.bookingRef}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        fontSize: '0.875rem',
                                                        bgcolor: 'primary.main'
                                                    }}
                                                >
                                                    {(users[booking.userId]?.username || '?').charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {users[booking.userId]?.username || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {users[booking.userId]?.email || 'No Email'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {events[booking.eventId]?.name || 'Unknown Event'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.ticketType}
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderRadius: 1, fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>{booking.quantity}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            ${booking.totalPrice.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                color={getStatusColor(booking.status) as any}
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.paymentStatus}
                                                size="small"
                                                color={getStatusColor(booking.paymentStatus) as any}
                                                variant="outlined"
                                                sx={{ fontWeight: 600, borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Receipt">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => navigate(`/my-bookings/${booking.bookingRef || booking.id}`)}
                                                        sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
                                                    >
                                                        <ReceiptIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View E-Ticket">
                                                    <IconButton
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => navigate(`/my-bookings/${booking.bookingRef || booking.id}`)}
                                                        sx={{ bgcolor: 'secondary.50', '&:hover': { bgcolor: 'secondary.100' } }}
                                                    >
                                                        <TicketIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredBookings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">No bookings found matching your filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredBookings.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Stack>
    );
};

export default AdminBookingManagement;
