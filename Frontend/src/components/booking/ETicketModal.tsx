import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Stack,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    QrCode2 as QrCodeIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import type { Booking } from '../../types/booking';
import type { Event } from '../../types';

interface ETicketModalProps {
    open: boolean;
    onClose: () => void;
    booking: Booking | null;
    event: Event | null;
}

const ETicketModal: React.FC<ETicketModalProps> = ({ open, onClose, booking, event }) => {
    const theme = useTheme();

    if (!booking || !event) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden',
                    backgroundImage: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
                }
            }}
        >
            <Box sx={{ position: 'relative', bgcolor: '#0B1020', p: 3, color: 'white' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': { color: 'white' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 1 }}>
                    E-TICKET
                </Typography>
                <Typography variant="body2" align="center" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                    {booking.bookingRef}
                </Typography>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 4 }}>
                    {/* Event Details */}
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#0B1020' }}>
                        {event.name}
                    </Typography>

                    <Stack spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <EventIcon color="primary" />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TimeIcon color="primary" />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Time</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {new Date(event.date).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <LocationIcon color="primary" />
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {event.location}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

                    {/* Ticket Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">TICKET TYPE</Typography>
                            <Typography variant="h6" fontWeight={700} color="primary">
                                {booking.ticketType}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">ADMIT</Typography>
                            <Typography variant="h6" fontWeight={700}>
                                {booking.quantity} Person{booking.quantity > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* QR Code Placeholder */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 3,
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                    }}>
                        <QrCodeIcon sx={{ fontSize: 120, color: '#0B1020' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Scan at the entrance
                        </Typography>
                    </Box>
                </Box>

                {/* Footer */}
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        This ticket is subject to the terms and conditions of EventHub.
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ETicketModal;
