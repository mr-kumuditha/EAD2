import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Autocomplete,
    TextField,
    Chip,
    Grid,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    DeleteSweep as DeleteSweepIcon,
    Refresh as RefreshIcon,
    AutoAwesome as AutoAwesomeIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { TicketService } from '../../services/ticketService';
import { eventService } from '../../services/eventService';
import type { Ticket, Event } from '../../types';
import TicketCard from './TicketCard';
import CreateTicketModal from './CreateTicketModal';
import EditTicketModal from './EditTicketModal';

type FilterType = 'all' | 'available' | 'sold_out' | 'inactive';

type Notification = {
    type: 'success' | 'error' | 'info';
    message: string;
};

const TicketManagement: React.FC = () => {
    const theme = useTheme();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

    const [createError, setCreateError] = useState<string | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [notification, setNotification] = useState<Notification | null>(null);

    // Load events
    const loadEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const allEvents = await eventService.getAllEvents();
            setEvents(allEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
            setNotification({ type: 'error', message: 'Failed to load events' });
        } finally {
            setEventsLoading(false);
        }
    }, []);

    // Load tickets for selected event
    const loadTickets = useCallback(async (eventId: number) => {
        setTicketsLoading(true);
        try {
            const eventTickets = await TicketService.getTicketsByEvent(eventId);
            setTickets(eventTickets);
        } catch (error) {
            console.error('Failed to load tickets:', error);
            setNotification({ type: 'error', message: 'Failed to load tickets' });
        } finally {
            setTicketsLoading(false);
        }
    }, []);

    // Filter tickets based on active filter
    useEffect(() => {
        let filtered = tickets;

        switch (activeFilter) {
            case 'available':
                filtered = tickets.filter(ticket => ticket.status === 'AVAILABLE');
                break;
            case 'sold_out':
                filtered = tickets.filter(ticket => ticket.status === 'SOLD_OUT');
                break;
            case 'inactive':
                filtered = tickets.filter(ticket => ticket.status === 'INACTIVE');
                break;
            default:
                filtered = tickets;
        }

        setFilteredTickets(filtered);
    }, [tickets, activeFilter]);

    // Load events on mount
    useEffect(() => {
        void loadEvents();
    }, [loadEvents]);

    // Load tickets when event changes
    useEffect(() => {
        if (selectedEvent) {
            void loadTickets(selectedEvent.id);
        } else {
            setTickets([]);
        }
    }, [selectedEvent, loadTickets]);

    const handleEventSelect = (event: Event | null) => {
        setSelectedEvent(event);
        setActiveFilter('all');
    };

    const handleCreateTicket = async (ticketData: Partial<Ticket>) => {
        if (!selectedEvent) return;

        setCreateLoading(true);
        setCreateError(null);

        try {
            // Ensure eventId is included
            const ticketWithEvent = {
                ...ticketData,
                eventId: selectedEvent.id
            };
            await TicketService.createTicket(ticketWithEvent as Ticket);
            setNotification({ type: 'success', message: 'Ticket created successfully' });
            setShowCreateModal(false);
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to create ticket:', error);
            setCreateError('Failed to create ticket. Please try again.');
            throw error;
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditTicket = (ticket: Ticket) => {
        setEditError(null);
        setEditingTicket(ticket);
        setShowEditModal(true);
    };

    const handleUpdateTicket = async (ticketData: Partial<Ticket>) => {
        if (!editingTicket || !selectedEvent) return;

        setEditLoading(true);
        setEditError(null);

        try {
            await TicketService.updateTicket(editingTicket.id, ticketData);
            setNotification({ type: 'success', message: 'Ticket updated successfully' });
            setShowEditModal(false);
            setEditingTicket(null);
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to update ticket:', error);
            setEditError('Failed to update ticket. Please try again.');
            throw error;
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteTicket = async (ticketId: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.');

        if (!confirmed || !selectedEvent) return;

        try {
            await TicketService.deleteTicket(ticketId);
            setNotification({ type: 'success', message: 'Ticket deleted successfully' });
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            setNotification({ type: 'error', message: 'Failed to delete ticket' });
        }
    };

    const handleReserveTickets = async (ticketId: number) => {
        const quantity = prompt('Enter quantity to reserve:');
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) return;

        try {
            await TicketService.reserveTickets(ticketId, Number(quantity));
            setNotification({ type: 'success', message: 'Tickets reserved successfully' });
            if (selectedEvent) {
                await loadTickets(selectedEvent.id);
            }
        } catch (error) {
            console.error('Failed to reserve tickets:', error);
            setNotification({ type: 'error', message: 'Failed to reserve tickets' });
        }
    };

    const handleChangeStatus = async (ticketId: number, newStatus?: Ticket['status']) => {
        if (!newStatus) {
            const status = prompt('Enter new status (AVAILABLE/SOLD_OUT/INACTIVE):');
            if (!status || !['AVAILABLE', 'SOLD_OUT', 'INACTIVE'].includes(status)) {
                alert('Invalid status. Please enter AVAILABLE, SOLD_OUT, or INACTIVE.');
                return;
            }
            newStatus = status as Ticket['status'];
        }

        if (!selectedEvent) return;

        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const updatedTicket = { ...ticket, status: newStatus };

        try {
            await TicketService.updateTicket(ticketId, updatedTicket);
            setNotification({ type: 'success', message: 'Ticket status updated successfully' });
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to update ticket status:', error);
            setNotification({ type: 'error', message: 'Failed to update ticket status' });
        }
    };

    const handleCreateDefaultTickets = async () => {
        if (!selectedEvent) return;

        try {
            await TicketService.createDefaultTickets(selectedEvent.id);
            setNotification({ type: 'success', message: 'Default tickets created successfully' });
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to create default tickets:', error);
            setNotification({ type: 'error', message: 'Failed to create default tickets' });
        }
    };

    const handleDeleteAllTickets = async () => {
        if (!selectedEvent) return;

        const confirmed = window.confirm('Are you sure you want to delete ALL tickets for this event? This action cannot be undone.');

        if (!confirmed) return;

        try {
            await TicketService.deleteAllTicketsForEvent(selectedEvent.id);
            setNotification({ type: 'success', message: 'All tickets deleted successfully' });
            await loadTickets(selectedEvent.id);
        } catch (error) {
            console.error('Failed to delete all tickets:', error);
            setNotification({ type: 'error', message: 'Failed to delete all tickets' });
        }
    };

    const handleRefresh = async () => {
        if (selectedEvent) {
            await loadTickets(selectedEvent.id);
            setNotification({ type: 'info', message: 'Tickets refreshed' });
        }
    };

    const handleNotificationClose = () => {
        setNotification(null);
    };

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'available', label: 'Available' },
        { value: 'sold_out', label: 'Sold Out' },
        { value: 'inactive', label: 'Inactive' }
    ];

    return (
        <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <TicketIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                    <div>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            Ticket Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage ticket types, availability, and pricing for each event
                        </Typography>
                    </div>
                </Stack>
            </Box>

            {/* Event Selector */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Select Event
                </Typography>
                <Autocomplete
                    options={events}
                    getOptionLabel={(event) => event.name}
                    value={selectedEvent}
                    onChange={(_, newValue) => handleEventSelect(newValue)}
                    loading={eventsLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Choose an event"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    )}
                    renderOption={(props, event) => (
                        <Box component="li" {...props}>
                            <Stack>
                                <Typography variant="body1">{event.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(event.date).toLocaleDateString()} • {event.location}
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                />
            </Paper>

            {selectedEvent && (
                <>
                    {/* Bulk Actions */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Bulk Actions
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Tooltip title="Create default tickets">
                                    <IconButton
                                        onClick={handleCreateDefaultTickets}
                                        sx={{
                                            color: theme.palette.secondary.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.secondary.main,
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <AutoAwesomeIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Refresh tickets">
                                    <IconButton
                                        onClick={handleRefresh}
                                        sx={{
                                            color: theme.palette.accent.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.accent.main,
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete all tickets">
                                    <IconButton
                                        onClick={handleDeleteAllTickets}
                                        sx={{
                                            color: theme.palette.error.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.error.main,
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        <DeleteSweepIcon />
                                    </IconButton>
                                </Tooltip>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowCreateModal(true)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Create Ticket
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Filters */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Filter Tickets
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {filterOptions.map((filter) => (
                                <Chip
                                    key={filter.value}
                                    label={filter.label}
                                    onClick={() => setActiveFilter(filter.value)}
                                    variant={activeFilter === filter.value ? 'filled' : 'outlined'}
                                    sx={{
                                        borderRadius: 2,
                                        ...(activeFilter === filter.value && {
                                            backgroundColor: theme.palette.accent.main,
                                            color: 'white'
                                        })
                                    }}
                                />
                            ))}
                        </Stack>
                    </Paper>

                    {/* Tickets Grid */}
                    <Box sx={{ mb: 3 }}>
                        {ticketsLoading ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography>Loading tickets...</Typography>
                            </Box>
                        ) : filteredTickets.length === 0 ? (
                            <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                    No tickets found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {activeFilter === 'all'
                                        ? 'Create your first ticket or use the auto-create feature.'
                                        : `No tickets match the "${activeFilter}" filter.`
                                    }
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredTickets.map((ticket) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={ticket.id}>
                                        <TicketCard
                                            ticket={ticket}
                                            onEdit={handleEditTicket}
                                            onDelete={handleDeleteTicket}
                                            onReserve={handleReserveTickets}
                                            onChangeStatus={handleChangeStatus}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </>
            )}

            {/* Modals */}
            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateTicket}
                loading={createLoading}
                error={createError}
                eventId={selectedEvent?.id || 0}
            />

            <EditTicketModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingTicket(null);
                }}
                onSubmit={handleUpdateTicket}
                loading={editLoading}
                error={editError}
                ticket={editingTicket}
            />

            {/* Notifications */}
            {notification && (
                <Snackbar
                    open={true}
                    autoHideDuration={4000}
                    onClose={handleNotificationClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert onClose={handleNotificationClose} severity={notification.type} variant="filled" sx={{ width: '100%' }}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default TicketManagement;