import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Stack,
    Divider,
    IconButton,
    Grid,
    Chip,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Print as PrintIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '../../types/booking';
import type { Event } from '../../types';

interface ReceiptModalProps {
    open: boolean;
    onClose: () => void;
    booking: Booking | null;
    event: Event | null;
    onDownloadPDF: (booking: Booking, event: Event) => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
    open,
    onClose,
    booking,
    event,
    onDownloadPDF
}) => {
    if (!booking || !event) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ bgcolor: '#2D4EC8', p: 3, color: 'white', position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
                <Stack alignItems="center" spacing={1}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#2ECC71', bgcolor: 'white', borderRadius: '50%' }} />
                    <Typography variant="h5" fontWeight={700}>Payment Receipt</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Reference: #{booking.bookingRef}
                    </Typography>
                </Stack>
            </Box>

            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                    {/* Event Details */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight={700} color="#1A1C2C">
                            {event.name}
                        </Typography>
                        <Typography variant="body2" color="#6E7687">
                            {formatDate(event.date)}
                        </Typography>
                        <Typography variant="body2" color="#6E7687">
                            {event.location}
                        </Typography>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Ticket Details */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="#6E7687">Ticket Type</Typography>
                            <Typography variant="subtitle1" fontWeight={600} color="#1A1C2C">
                                {booking.ticketType}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="#6E7687">Quantity</Typography>
                            <Typography variant="subtitle1" fontWeight={600} color="#1A1C2C">
                                {booking.quantity}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="#6E7687">Payment Status</Typography>
                            <Chip
                                label={booking.paymentStatus}
                                size="small"
                                sx={{
                                    bgcolor: alpha('#2ECC71', 0.1),
                                    color: '#2ECC71',
                                    fontWeight: 700,
                                    mt: 0.5
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="#6E7687">Total Amount</Typography>
                            <Typography variant="h6" fontWeight={700} color="#2D4EC8">
                                ${booking.totalPrice.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* QR Code */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <Box sx={{ p: 2, border: '1px solid #E9ECF2', borderRadius: 2 }}>
                            <QRCodeSVG value={booking.bookingRef} size={120} />
                        </Box>
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <IconButton
                            onClick={() => window.print()}
                            sx={{
                                border: '1px solid #E9ECF2',
                                color: '#6E7687',
                                '&:hover': { bgcolor: '#F5F7FB' }
                            }}
                        >
                            <PrintIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => onDownloadPDF(booking, event)}
                            sx={{
                                bgcolor: '#2ECC71',
                                color: 'white',
                                '&:hover': { bgcolor: '#27ae60' }
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiptModal;
