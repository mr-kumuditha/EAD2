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

const AdminBookingsView: React.FC = () => {
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
    }, [bookings, searchTerm, statusFilter, eventFilter]);

    const loadData = async () => {
        try {
            const [allBookings, allEvents, allUsers] = await Promise.all([
                BookingService.getAllBookings(),
                eventService.getAllEvents(),
                userService.getAllUsers()
            ]);

            setBookings(allBookings);

            const eventsMap: Record<number, Event> = {};
            allEvents.forEach(e => eventsMap[e.id] = e);
            setEvents(eventsMap);

            const usersMap: Record<number, User> = {};
            allUsers.forEach(u => usersMap[u.userId] = u);
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
                b.bookingRef.toLowerCase().includes(lowerTerm) ||
                users[b.userId]?.username.toLowerCase().includes(lowerTerm) ||
                users[b.userId]?.email.toLowerCase().includes(lowerTerm)
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
            case 'CONFIRMED': return '#4CAF50';
            case 'PENDING': return '#FF9800';
            case 'CANCELLED': return '#F44336';
            case 'EXPIRED': return '#9E9E9E';
            case 'COMPLETED': return '#4CAF50';
            case 'FAILED': return '#F44336';
            case 'REFUNDED': return '#9C27B0';
            default: return '#9E9E9E';
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
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E6F0FF' }}>
                Booking Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0B7C3', mb: 4 }}>
                Manage and track all user bookings, payments, and tickets.
            </Typography>

            {/* Filters */}
            <Paper sx={{
                p: 3,
                mb: 4,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 3
            }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#666' }} /></InputAdornment>,
                        }}
                        sx={{
                            flex: 1,
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            input: { color: '#E6F0FF' }
                        }}
                    />
                    <TextField
                        select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                            minWidth: 200,
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-select': { color: '#E6F0FF' },
                            '& .MuiSvgIcon-root': { color: '#666' }
                        }}
                    >
                        <MenuItem value="ALL">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </TextField>
                    <TextField
                        select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        sx={{
                            minWidth: 200,
                            bgcolor: 'rgba(0,0,0,0.2)',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-select': { color: '#E6F0FF' },
                            '& .MuiSvgIcon-root': { color: '#666' }
                        }}
                    >
                        <MenuItem value="ALL">All Events</MenuItem>
                        {uniqueEvents.map(event => (
                            <MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper sx={{
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                overflow: 'hidden'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Booking ID</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>User</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Event</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Ticket</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Qty</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Total</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Payment</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((booking) => (
                                    <TableRow
                                        key={booking.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(77, 163, 255, 0.05)' },
                                            borderBottom: '1px solid rgba(255,255,255,0.02)'
                                        }}
                                    >
                                        <TableCell sx={{ color: '#E6F0FF', fontFamily: 'monospace' }}>{booking.bookingRef}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#4DA3FF' }}>
                                                    {users[booking.userId]?.username.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#E6F0FF' }}>{users[booking.userId]?.username}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#B0B7C3' }}>{users[booking.userId]?.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>{events[booking.eventId]?.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.ticketType}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    color: '#E6F0FF',
                                                    height: 24,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#E6F0FF' }}>{booking.quantity}</TableCell>
                                        <TableCell sx={{ color: '#E6F0FF', fontWeight: 600 }}>${booking.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getStatusColor(booking.status)}20`,
                                                    color: getStatusColor(booking.status),
                                                    fontWeight: 600,
                                                    border: `1px solid ${getStatusColor(booking.status)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.paymentStatus}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getStatusColor(booking.paymentStatus)}20`,
                                                    color: getStatusColor(booking.paymentStatus),
                                                    fontWeight: 600,
                                                    border: `1px solid ${getStatusColor(booking.paymentStatus)}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Receipt">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#4DA3FF', bgcolor: 'rgba(77, 163, 255, 0.1)' }}
                                                        onClick={() => navigate(`/booking/${booking.id}`)}
                                                    >
                                                        <ReceiptIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View E-Ticket">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#836FFF', bgcolor: 'rgba(131, 111, 255, 0.1)' }}
                                                        onClick={() => navigate(`/booking/${booking.id}`)}
                                                    >
                                                        <TicketIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                    sx={{
                        color: '#B0B7C3',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        '.MuiTablePagination-select': { color: '#E6F0FF' },
                        '.MuiTablePagination-selectIcon': { color: '#B0B7C3' }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default AdminBookingsView;
