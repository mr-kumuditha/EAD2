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
    TablePagination,
    Stack,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    CreditCard as CardIcon
} from '@mui/icons-material';
import { BookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import type { Booking } from '../../types/booking';
import type { User } from '../../types';

const AdminPaymentsView: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [users, setUsers] = useState<Record<number, User>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = bookings.filter(b =>
            b.bookingRef.toLowerCase().includes(lowerTerm) ||
            users[b.userId]?.email.toLowerCase().includes(lowerTerm)
        );
        setFilteredBookings(filtered);
        setPage(0);
    }, [searchTerm, bookings, users]);

    const loadData = async () => {
        try {
            const [allBookings, allUsers] = await Promise.all([
                BookingService.getAllBookings(),
                userService.getAllUsers()
            ]);

            // Filter only completed or refunded payments for this view ideally, but showing all for now
            setBookings(allBookings);

            const usersMap: Record<number, User> = {};
            allUsers.forEach(u => usersMap[u.userId] = u);
            setUsers(usersMap);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setLoading(false);
        }
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
            case 'COMPLETED': return '#4CAF50';
            case 'PENDING': return '#FF9800';
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

    const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'COMPLETED')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E6F0FF' }}>
                        Payment Transactions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#B0B7C3' }}>
                        Monitor all financial transactions and refunds.
                    </Typography>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(76, 175, 80, 0.2)', borderRadius: '50%', color: '#4CAF50' }}>
                            <MoneyIcon />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#B0B7C3', textTransform: 'uppercase' }}>Total Revenue</Typography>
                            <Typography variant="h6" sx={{ color: '#E6F0FF', fontWeight: 700 }}>${totalRevenue.toLocaleString()}</Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>

            <Paper sx={{
                p: 3,
                mb: 4,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 3
            }}>
                <TextField
                    fullWidth
                    placeholder="Search transactions by reference or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#666' }} /></InputAdornment>,
                    }}
                    sx={{
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        input: { color: '#E6F0FF' }
                    }}
                />
            </Paper>

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
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Transaction ID</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>User</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Method</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
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
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            {users[booking.userId]?.email}
                                        </TableCell>
                                        <TableCell sx={{ color: '#E6F0FF', fontWeight: 600 }}>${booking.totalPrice.toFixed(2)}</TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <CardIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">Credit Card</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            {new Date(booking.createdAt).toLocaleDateString()}
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
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#4DA3FF', bgcolor: 'rgba(77, 163, 255, 0.1)' }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Receipt">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#836FFF', bgcolor: 'rgba(131, 111, 255, 0.1)' }}
                                                    >
                                                        <ReceiptIcon fontSize="small" />
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

export default AdminPaymentsView;
