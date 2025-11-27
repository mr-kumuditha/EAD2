import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    Stack,
    Tabs,
    Tab,
    Typography,
    TextField,
    Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { UpdateUserRequest } from '../services/userService';
import CreateEventModal from '../components/events/CreateEventModal';
import EditEventModal from '../components/events/EditEventModal';
import EventCard from '../components/events/EventCard';
import AdminBookingManagement from '../components/admin/AdminBookingManagement';
import TicketManagement from '../components/tickets/TicketManagement';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import type { CreateEventRequest, Event, UpdateEventRequest } from '../types';
import { eventService } from '../services/eventService';
import { userService } from '../services/userService';

type AdminTab = 'events' | 'tickets' | 'profile' | 'bookings';

type Notification = {
    type: 'success' | 'error' | 'info';
    message: string;
};

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('events');

    // Events state
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [createEventError, setCreateEventError] = useState<string | null>(null);
    const [createEventLoading, setCreateEventLoading] = useState(false);
    const [showEditEventModal, setShowEditEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [editEventError, setEditEventError] = useState<string | null>(null);
    const [editEventLoading, setEditEventLoading] = useState(false);

    // Profile state
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Notification
    const [notification, setNotification] = useState<Notification | null>(null);

    const categoryOptions = [
        'Technology',
        'Music',
        'Business',
        'Arts',
        'Sports',
        'Food & Drink',
        'Health & Wellness',
        'Education'
    ];

    // Events functions
    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        setEventsError(null);

        try {
            const allEvents = await eventService.getAllEvents();
            setEvents(allEvents);
        } catch (error) {
            console.error('Failed to load events:', error);
            setEventsError('Unable to load events right now. Please try again.');
        } finally {
            setEventsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'events') {
            void fetchEvents();
        }
    }, [fetchEvents, activeTab]);

    const handleOpenCreateEvent = () => {
        setCreateEventError(null);
        setShowCreateEventModal(true);
    };

    const handleCloseCreateEvent = () => {
        setShowCreateEventModal(false);
    };

    const handleCreateEventSubmit = async (formValues: CreateEventRequest) => {
        setCreateEventLoading(true);
        setCreateEventError(null);

        try {
            const createdEvent = await eventService.createEvent(formValues);

            setEvents((prev) => {
                const existingIds = new Set(prev.map((event) => event.id));
                if (existingIds.has(createdEvent.id)) {
                    return prev.map((event) => (event.id === createdEvent.id ? createdEvent : event));
                }

                return [createdEvent, ...prev];
            });

            setNotification({ type: 'success', message: 'Event created successfully.' });
            setShowCreateEventModal(false);
        } catch (error) {
            console.error('Failed to create event:', error);
            setCreateEventError('Failed to create event. Please try again.');
            setNotification({ type: 'error', message: 'Unable to create event. Please try again.' });
            throw error;
        } finally {
            setCreateEventLoading(false);
        }
    };

    const handleEditEventClick = (event: Event) => {
        setEditEventError(null);
        setEditingEvent(event);
        setShowEditEventModal(true);
    };

    const handleCloseEditEvent = () => {
        setShowEditEventModal(false);
        setEditEventError(null);
        setEditingEvent(null);
    };

    const handleUpdateEventSubmit = async (formValues: UpdateEventRequest, imageFile?: File) => {
        if (!editingEvent) {
            return;
        }

        setEditEventLoading(true);
        setEditEventError(null);

        try {
            const updatedEvent = await eventService.updateEvent(editingEvent.id, formValues, imageFile);

            setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));

            setNotification({ type: 'success', message: 'Event updated successfully.' });
            handleCloseEditEvent();
        } catch (error) {
            console.error('Failed to update event:', error);
            setEditEventError('Failed to update event. Please try again.');
            setNotification({ type: 'error', message: 'Unable to update event. Please try again.' });
            throw error;
        } finally {
            setEditEventLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');

        if (!confirmed) {
            return;
        }

        try {
            await eventService.deleteEvent(eventId);
            setEvents((prev) => prev.filter((event) => event.id !== eventId));
            setNotification({ type: 'success', message: 'Event deleted successfully.' });
        } catch (error) {
            console.error('Failed to delete event:', error);
            setNotification({ type: 'error', message: 'Unable to delete event. Please try again.' });
        }
    };

    // Profile functions
    const handleUpdateProfileSubmit = async () => {
        setProfileLoading(true);
        setProfileError(null);

        try {
            const userData: UpdateUserRequest = {
                username: profileData.username,
                email: profileData.email,
            };

            if (profileData.password) {
                // Note: In a real app, you'd handle password updates separately
            }

            if (user?.userId) {
                await userService.updateUser(user.userId, userData);
                setNotification({ type: 'success', message: 'Profile updated successfully.' });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setProfileError('Failed to update profile. Please try again.');
            setNotification({ type: 'error', message: 'Unable to update profile. Please try again.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleNotificationClose = () => {
        setNotification(null);
    };

    // Redirect non-admin users
    if (!user || user.role !== 'ADMIN') {
        return (
            <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                        <Typography variant="h2" component="div" color="warning.main" sx={{ mb: 2 }}>
                            ⚠️
                        </Typography>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                            Access Denied
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            You don't have permission to access the admin dashboard. This area is restricted to administrators only.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/events"
                            variant="contained"
                            color="primary"
                        >
                            Back to Events
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ py: 3, gap: 2 }}>
                        <div>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Admin Panel
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Welcome back, {user.firstName || user.username}!
                            </Typography>
                        </div>
                        <Button
                            component={RouterLink}
                            to="/events"
                            variant="outlined"
                            color="primary"
                        >
                            View Public Events
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_event, value) => setActiveTab(value)}
                        variant="fullWidth"
                    >
                        <Tab
                            icon={<EventIcon />}
                            label="Events"
                            value="events"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<ReceiptLongIcon />}
                            label="Bookings"
                            value="bookings"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<ConfirmationNumberIcon />}
                            label="Tickets"
                            value="tickets"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<PersonIcon />}
                            label="Profile"
                            value="profile"
                            iconPosition="start"
                        />
                    </Tabs>

                    <Box sx={{ p: 4 }}>
                        {activeTab === 'events' && (
                            <Stack spacing={3}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                                    <div>
                                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                            Event Management
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Manage all events in the system
                                        </Typography>
                                    </div>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenCreateEvent}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Create Event
                                    </Button>
                                </Stack>

                                {eventsError && (
                                    <Alert severity="error">{eventsError}</Alert>
                                )}

                                {eventsLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                        <Typography>Loading events...</Typography>
                                    </Box>
                                ) : events.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <Typography color="text.secondary">No events found</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 3 }}>
                                        {events.map((event) => (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                onEdit={handleEditEventClick}
                                                onDelete={handleDeleteEvent}
                                                isAdmin={true}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Stack>
                        )}

                        {activeTab === 'bookings' && (
                            <AdminBookingManagement />
                        )}

                        {activeTab === 'tickets' && (
                            <TicketManagement />
                        )}

                        {activeTab === 'profile' && (
                            <Stack spacing={3}>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Admin Profile
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Username"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="New Password"
                                            type="password"
                                            value={profileData.password}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                                            variant="outlined"
                                            helperText="Leave empty to keep current password"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Confirm New Password"
                                            type="password"
                                            value={profileData.confirmPassword}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>

                                {profileError && (
                                    <Alert severity="error">{profileError}</Alert>
                                )}

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setProfileData({
                                            username: user?.username || '',
                                            email: user?.email || '',
                                            password: '',
                                            confirmPassword: ''
                                        })}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleUpdateProfileSubmit}
                                        disabled={profileLoading}
                                        sx={{ minWidth: 120 }}
                                    >
                                        {profileLoading ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </Box>
                            </Stack>
                        )}
                    </Box>
                </Paper>
            </Container>

            <CreateEventModal
                isOpen={showCreateEventModal}
                onClose={handleCloseCreateEvent}
                onSubmit={handleCreateEventSubmit}
                loading={createEventLoading}
                error={createEventError}
                categories={categoryOptions}
            />
            <EditEventModal
                isOpen={showEditEventModal}
                onClose={handleCloseEditEvent}
                onSubmit={handleUpdateEventSubmit}
                loading={editEventLoading}
                error={editEventError}
                event={editingEvent}
                categories={categoryOptions}
            />

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

export default AdminPage;
