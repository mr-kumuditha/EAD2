import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Stack,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Alert,
    Snackbar,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Event as EventIcon,
    ConfirmationNumber as TicketIcon,
    Receipt as ReceiptIcon,
    Assessment as ReportIcon,
    Search as SearchIcon,
    FileDownload as ExportIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachMoney as MoneyIcon,
    Schedule as PendingIcon,
    CheckCircle as ConfirmedIcon,
    Cancel as CancelIcon,
    Undo as RefundIcon,
    Visibility as ViewIcon,
    CreditCard as CardIcon,
    DateRange as DateRangeIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { BookingService } from '../services/bookingService';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';
import type { Booking } from '../types/booking';
import type { Event } from '../types';
import type { User } from '../types';
import AdminBookingsView from '../components/admin/AdminBookingsView';
import AdminEventsView from '../components/admin/AdminEventsView';
import AdminPaymentsView from '../components/admin/AdminPaymentsView';

// --- Components ---

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <Button
        fullWidth
        startIcon={icon}
        onClick={onClick}
        sx={{
            justifyContent: 'flex-start',
            color: active ? '#4DA3FF' : '#B0B7C3',
            bgcolor: active ? 'rgba(77, 163, 255, 0.1)' : 'transparent',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            mb: 1,
            fontWeight: active ? 600 : 500,
            '&:hover': {
                bgcolor: 'rgba(77, 163, 255, 0.05)',
                color: '#E6F0FF'
            },
            transition: 'all 0.2s ease'
        }}
    >
        {label}
    </Button>
);

const KPICard = ({ title, value, subtext, icon, trend, color }: any) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            height: '100%',
            transition: 'transform 0.2s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                bgcolor: 'rgba(255, 255, 255, 0.05)'
            }
        }}
    >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}20`, color: color }}>
                {icon}
            </Box>
            {trend && (
                <Chip
                    size="small"
                    icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={trend === 'up' ? '+12.5%' : '-2.4%'}
                    sx={{
                        bgcolor: trend === 'up' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        color: trend === 'up' ? '#4CAF50' : '#F44336',
                        fontWeight: 600
                    }}
                />
            )}
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#E6F0FF', mb: 0.5 }}>
            {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#B0B7C3' }}>
            {title}
        </Typography>
        {subtext && (
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
                {subtext}
            </Typography>
        )}
    </Paper>
);

const StatusChip = ({ status, type }: { status: string, type: 'booking' | 'payment' }) => {
    let color = '#9E9E9E';
    let bg = 'rgba(158, 158, 158, 0.1)';

    if (type === 'booking') {
        switch (status) {
            case 'CONFIRMED': color = '#4CAF50'; bg = 'rgba(76, 175, 80, 0.1)'; break;
            case 'PENDING': color = '#FF9800'; bg = 'rgba(255, 152, 0, 0.1)'; break;
            case 'CANCELLED': color = '#F44336'; bg = 'rgba(244, 67, 54, 0.1)'; break;
            case 'EXPIRED': color = '#9E9E9E'; bg = 'rgba(158, 158, 158, 0.1)'; break;
        }
    } else {
        switch (status) {
            case 'COMPLETED': color = '#4CAF50'; bg = 'rgba(76, 175, 80, 0.1)'; break;
            case 'PENDING': color = '#FF9800'; bg = 'rgba(255, 152, 0, 0.1)'; break;
            case 'FAILED': color = '#F44336'; bg = 'rgba(244, 67, 54, 0.1)'; break;
            case 'REFUNDED': color = '#9C27B0'; bg = 'rgba(156, 39, 176, 0.1)'; break;
        }
    }

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bg,
                color: color,
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${color}40`
            }}
        />
    );
};

const AdminDashboardPage: React.FC = () => {
    // --- State ---
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [events, setEvents] = useState<Record<number, Event>>({});
    const [users, setUsers] = useState<Record<number, User>>({});
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // --- Effects ---
    useEffect(() => {
        loadData();
    }, []);

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
            console.error('Failed to load dashboard data:', error);
            setNotification({ type: 'error', message: 'Failed to load data' });
            setBookings([]); // Fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    // --- Computed Data ---
    const filteredBookings = useMemo(() => {
        return bookings.filter(b =>
            (b.bookingRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (users[b.userId]?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (users[b.userId]?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bookings, searchTerm, users]);

    const kpiData = useMemo(() => {
        const totalRevenue = bookings
            .filter(b => b.paymentStatus === 'COMPLETED')
            .reduce((sum, b) => sum + b.totalPrice, 0);

        const pendingRevenue = bookings
            .filter(b => b.status === 'PENDING')
            .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
            totalBookings: bookings.length,
            confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
            totalRevenue,
            pendingRevenue,
            refundedCount: bookings.filter(b => b.paymentStatus === 'REFUNDED').length
        };
    }, [bookings]);

    // --- Actions ---
    const handleAction = async (action: 'confirm' | 'cancel' | 'refund', bookingId: number) => {
        try {
            if (action === 'confirm') await BookingService.confirmBooking(bookingId);
            if (action === 'cancel') await BookingService.cancelBooking(bookingId);
            if (action === 'refund') await BookingService.refundBooking(bookingId);

            setNotification({ type: 'success', message: `Booking ${action}ed successfully` });
            loadData(); // Refresh
            if (selectedBooking?.id === bookingId) {
                setSelectedBooking(null); // Close panel if action affects selected
            }
        } catch (error) {
            console.error(`Failed to ${action} booking:`, error);
            setNotification({ type: 'error', message: `Failed to ${action} booking` });
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#0B1020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinearProgress sx={{ width: 200 }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1020', color: '#E6F0FF' }}>

            {/* Sidebar */}
            <Box sx={{
                width: 280,
                borderRight: '1px solid rgba(255,255,255,0.05)',
                p: 3,
                display: { xs: 'none', md: 'block' },
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <Typography variant="h5" sx={{
                    fontWeight: 800,
                    mb: 4,
                    background: 'linear-gradient(135deg, #4DA3FF 0%, #836FFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    EVENTHUB ADMIN
                </Typography>

                <Stack spacing={1}>
                    <SidebarItem icon={<DashboardIcon />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={<EventIcon />} label="Events" active={activeTab === 'events'} onClick={() => setActiveTab('events')} />
                    <SidebarItem icon={<TicketIcon />} label="Tickets" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
                    <SidebarItem icon={<ReceiptIcon />} label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
                    <SidebarItem icon={<MoneyIcon />} label="Payments" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                    <SidebarItem icon={<ReportIcon />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                </Stack>

                <Box sx={{ mt: 'auto', pt: 4 }}>
                    <Card sx={{ bgcolor: 'rgba(77, 163, 255, 0.1)', border: '1px solid rgba(77, 163, 255, 0.2)', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{ color: '#4DA3FF', fontWeight: 600, mb: 1 }}>
                                System Status
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                                <Typography variant="caption" sx={{ color: '#B0B7C3' }}>
                                    All Systems Operational
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{
                flex: 1,
                ml: { md: '280px' },
                p: 4,
                width: '100%'
            }}>
                {activeTab === 'dashboard' && (
                    <>
                        {/* Top Bar */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                    Dashboard Overview
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#B0B7C3' }}>
                                    Welcome back, Admin. Here's what's happening today.
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    startIcon={<DateRangeIcon />}
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#B0B7C3',
                                        '&:hover': { borderColor: '#4DA3FF', color: '#4DA3FF' }
                                    }}
                                >
                                    Last 30 Days
                                </Button>
                                <Button
                                    startIcon={<ExportIcon />}
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#4DA3FF',
                                        '&:hover': { bgcolor: '#3a8ce5' }
                                    }}
                                >
                                    Export Report
                                </Button>
                            </Stack>
                        </Stack>

                        {/* KPI Cards */}
                        <Grid container spacing={3} mb={4}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <KPICard
                                    title="Total Revenue"
                                    value={`$${kpiData.totalRevenue.toLocaleString()}`}
                                    icon={<MoneyIcon />}
                                    color="#4CAF50"
                                    trend="up"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <KPICard
                                    title="Total Bookings"
                                    value={kpiData.totalBookings}
                                    icon={<TicketIcon />}
                                    color="#4DA3FF"
                                    trend="up"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <KPICard
                                    title="Pending Revenue"
                                    value={`$${kpiData.pendingRevenue.toLocaleString()}`}
                                    subtext={`${bookings.filter(b => b.status === 'PENDING').length} bookings pending`}
                                    icon={<PendingIcon />}
                                    color="#FF9800"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <KPICard
                                    title="Refunds Processed"
                                    value={kpiData.refundedCount}
                                    icon={<RefundIcon />}
                                    color="#F44336"
                                    trend="down"
                                />
                            </Grid>
                        </Grid>

                        {/* Split View: Table & Detail Panel */}
                        <Grid container spacing={3}>
                            {/* Left: Bookings Table */}
                            <Grid size={{ xs: 12, lg: selectedBooking ? 8 : 12 }} sx={{ transition: 'all 0.3s ease' }}>
                                <Paper sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: 3,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Bookings</Typography>
                                            <TextField
                                                size="small"
                                                placeholder="Search bookings..."
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
                                        </Stack>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: 600 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Ref</TableCell>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>User</TableCell>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Event</TableCell>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</TableCell>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                                                    <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredBookings.map((booking) => (
                                                    <TableRow
                                                        key={booking.id}
                                                        onClick={() => setSelectedBooking(booking)}
                                                        selected={selectedBooking?.id === booking.id}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { bgcolor: 'rgba(77, 163, 255, 0.05)' },
                                                            '&.Mui-selected': { bgcolor: 'rgba(77, 163, 255, 0.1) !important' },
                                                            borderBottom: '1px solid rgba(255,255,255,0.02)'
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: '#E6F0FF', fontWeight: 500 }}>{booking.bookingRef}</TableCell>
                                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: '#4DA3FF' }}>
                                                                    {(users[booking.userId]?.username || '?').charAt(0).toUpperCase()}
                                                                </Avatar>
                                                                <Typography variant="body2">{users[booking.userId]?.username || 'Unknown User'}</Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#B0B7C3' }}>{events[booking.eventId]?.name}</TableCell>
                                                        <TableCell sx={{ color: '#E6F0FF', fontWeight: 600 }}>${booking.totalPrice.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1}>
                                                                <StatusChip status={booking.status} type="booking" />
                                                                <StatusChip status={booking.paymentStatus} type="payment" />
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton size="small" sx={{ color: '#B0B7C3' }}>
                                                                <ViewIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            {/* Right: Payment Detail Panel */}
                            {selectedBooking && (
                                <Grid size={{ xs: 12, lg: 4 }}>
                                    <Paper sx={{
                                        bgcolor: '#1A2035',
                                        borderRadius: 3,
                                        height: '100%',
                                        position: 'sticky',
                                        top: 24,
                                        border: '1px solid rgba(77, 163, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                    }}>
                                        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Booking Details</Typography>
                                                <IconButton onClick={() => setSelectedBooking(null)} sx={{ color: '#B0B7C3' }}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </Stack>
                                        </Box>

                                        <Box sx={{ p: 3 }}>
                                            {/* Header Info */}
                                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#E6F0FF', mb: 1 }}>
                                                    ${selectedBooking.totalPrice.toFixed(2)}
                                                </Typography>
                                                <Chip
                                                    label={selectedBooking.status}
                                                    sx={{
                                                        bgcolor: selectedBooking.status === 'CONFIRMED' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                                                        color: selectedBooking.status === 'CONFIRMED' ? '#4CAF50' : '#FF9800',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </Box>

                                            {/* Info Grid */}
                                            <Stack spacing={3}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Customer</Typography>
                                                    <Stack direction="row" alignItems="center" spacing={2} mt={1}>
                                                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#4DA3FF' }}>
                                                            {(users[selectedBooking.userId]?.username || '?').charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2">{users[selectedBooking.userId]?.username || 'Unknown User'}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#B0B7C3' }}>{users[selectedBooking.userId]?.email || 'No Email'}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>

                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Event Info</Typography>
                                                    <Paper sx={{ p: 2, mt: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{events[selectedBooking.eventId]?.name}</Typography>
                                                        <Stack direction="row" spacing={2}>
                                                            <Chip label={selectedBooking.ticketType} size="small" sx={{ borderRadius: 1, height: 20, fontSize: 10 }} />
                                                            <Typography variant="caption" sx={{ color: '#B0B7C3' }}>Qty: {selectedBooking.quantity}</Typography>
                                                        </Stack>
                                                    </Paper>
                                                </Box>

                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Payment Info</Typography>
                                                    <Stack spacing={1} mt={1}>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" sx={{ color: '#B0B7C3' }}>Ref ID</Typography>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedBooking.bookingRef}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" sx={{ color: '#B0B7C3' }}>Method</Typography>
                                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                <CardIcon sx={{ fontSize: 16, color: '#B0B7C3' }} />
                                                                <Typography variant="body2">Credit Card</Typography>
                                                            </Stack>
                                                        </Stack>
                                                        <Stack direction="row" justifyContent="space-between">
                                                            <Typography variant="body2" sx={{ color: '#B0B7C3' }}>Date</Typography>
                                                            <Typography variant="body2">{new Date(selectedBooking.createdAt).toLocaleDateString()}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Box>
                                            </Stack>

                                            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

                                            {/* Actions */}
                                            <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', letterSpacing: 1, mb: 2, display: 'block' }}>Quick Actions</Typography>
                                            <Stack spacing={2}>
                                                {selectedBooking.status === 'PENDING' && (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        fullWidth
                                                        startIcon={<ConfirmedIcon />}
                                                        onClick={() => handleAction('confirm', selectedBooking.id)}
                                                    >
                                                        Force Confirm
                                                    </Button>
                                                )}
                                                {selectedBooking.paymentStatus === 'COMPLETED' && (
                                                    <Button
                                                        variant="outlined"
                                                        color="warning"
                                                        fullWidth
                                                        startIcon={<RefundIcon />}
                                                        onClick={() => handleAction('refund', selectedBooking.id)}
                                                    >
                                                        Issue Refund
                                                    </Button>
                                                )}
                                                {selectedBooking.status !== 'CANCELLED' && (
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        fullWidth
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleAction('cancel', selectedBooking.id)}
                                                    >
                                                        Cancel Booking
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </>
                )}

                {activeTab === 'bookings' && <AdminBookingsView />}
                {activeTab === 'events' && <AdminEventsView />}
                {activeTab === 'payments' && <AdminPaymentsView />}
                {(activeTab === 'tickets' || activeTab === 'reports') && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
                        <Typography variant="h4" sx={{ color: '#E6F0FF', mb: 2, fontWeight: 700 }}>Coming Soon</Typography>
                        <Typography variant="body1" sx={{ color: '#B0B7C3' }}>This feature is currently under development.</Typography>
                    </Box>
                )}
            </Box>
            {/* Notifications */}
            {notification && (
                <Snackbar
                    open={true}
                    autoHideDuration={4000}
                    onClose={() => setNotification(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={notification.type} variant="filled" onClose={() => setNotification(null)}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default AdminDashboardPage;
