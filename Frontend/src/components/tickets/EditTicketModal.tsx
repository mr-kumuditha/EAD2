import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import type { UpdateTicketRequest, Ticket } from '../../types';

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (ticketData: UpdateTicketRequest) => Promise<void>;
    loading: boolean;
    error: string | null;
    ticket: Ticket | null;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading,
    error,
    ticket
}) => {
    const [formData, setFormData] = useState<UpdateTicketRequest>({
        type: 'STANDARD',
        price: 0,
        quantityAvailable: 100,
        maxPerUser: 4,
        description: '',
        status: 'AVAILABLE'
    });

    const ticketTypes: Ticket['type'][] = ['EARLY_BIRD', 'STANDARD', 'VIP'];
    const ticketStatuses: Ticket['status'][] = ['AVAILABLE', 'SOLD_OUT', 'INACTIVE'];

    useEffect(() => {
        if (ticket) {
            setFormData({
                type: ticket.type,
                price: ticket.price,
                quantityAvailable: ticket.quantityAvailable,
                maxPerUser: ticket.maxPerUser,
                description: ticket.description,
                status: ticket.status
            });
        }
    }, [ticket]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
        } catch {
            // Error is handled by parent
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!ticket) return null;

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
                }
            }}
        >
            <DialogTitle component="div" sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Edit Ticket
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Update ticket details for {ticket.type.replace('_', ' ')}
                </Typography>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            select
                            label="Ticket Type"
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                type: e.target.value as Ticket['type']
                            }))}
                            required
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        >
                            {ticketTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type.replace('_', ' ')}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Price ($)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                price: parseFloat(e.target.value) || 0
                            }))}
                            required
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <TextField
                            label="Quantity Available"
                            type="number"
                            value={formData.quantityAvailable}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                quantityAvailable: parseInt(e.target.value) || 0
                            }))}
                            required
                            fullWidth
                            inputProps={{ min: 0 }}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <TextField
                            label="Max Per User"
                            type="number"
                            value={formData.maxPerUser}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                maxPerUser: parseInt(e.target.value) || 1
                            }))}
                            required
                            fullWidth
                            inputProps={{ min: 1 }}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            required
                            fullWidth
                            placeholder="Describe this ticket type..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />

                        <TextField
                            select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                status: e.target.value as Ticket['status']
                            }))}
                            required
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        >
                            {ticketStatuses.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            minWidth: 120
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            'Update Ticket'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditTicketModal;
