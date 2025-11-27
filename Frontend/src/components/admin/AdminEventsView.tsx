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
    Button,
    Stack,
    TextField,
    InputAdornment,
    TablePagination,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Event as EventIcon,
    LocationOn as LocationIcon
} from '@mui/icons-material';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types';

const AdminEventsView: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = events.filter(e =>
            e.name.toLowerCase().includes(lowerTerm) ||
            e.location.toLowerCase().includes(lowerTerm) ||
            e.category.toLowerCase().includes(lowerTerm)
        );
        setFilteredEvents(filtered);
        setPage(0);
    }, [searchTerm, events]);

    const loadEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventService.deleteEvent(id);
                loadEvents();
            } catch (error) {
                console.error('Failed to delete event:', error);
            }
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
            case 'ACTIVE': return '#4CAF50';
            case 'UPCOMING': return '#2196F3';
            case 'COMPLETED': return '#9E9E9E';
            case 'CANCELLED': return '#F44336';
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

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#E6F0FF' }}>
                        Event Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#B0B7C3' }}>
                        Create, edit, and manage all events.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        bgcolor: '#4DA3FF',
                        '&:hover': { bgcolor: '#3a8ce5' }
                    }}
                >
                    Create Event
                </Button>
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
                    placeholder="Search events by name, location, or category..."
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
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Event Name</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Location</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Category</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: '#131929', color: '#B0B7C3', borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEvents
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((event) => (
                                    <TableRow
                                        key={event.id}
                                        sx={{
                                            '&:hover': { bgcolor: 'rgba(77, 163, 255, 0.05)' },
                                            borderBottom: '1px solid rgba(255,255,255,0.02)'
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Box
                                                    component="img"
                                                    src={event.imageUrl || 'https://via.placeholder.com/40'}
                                                    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#E6F0FF', fontWeight: 600 }}>{event.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#B0B7C3' }}>ID: {event.id}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <EventIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">{new Date(event.date).toLocaleDateString()}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ color: '#B0B7C3' }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <LocationIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">{event.location}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    color: '#E6F0FF',
                                                    height: 24,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.status || 'ACTIVE'}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getStatusColor(event.status || 'ACTIVE')}20`,
                                                    color: getStatusColor(event.status || 'ACTIVE'),
                                                    fontWeight: 600,
                                                    border: `1px solid ${getStatusColor(event.status || 'ACTIVE')}40`
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#4DA3FF', bgcolor: 'rgba(77, 163, 255, 0.1)' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#F44336', bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                                                        onClick={() => handleDelete(event.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
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
                    count={filteredEvents.length}
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

export default AdminEventsView;
