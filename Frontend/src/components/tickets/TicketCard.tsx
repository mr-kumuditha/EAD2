import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Stack,
    IconButton,
    Tooltip,
    useTheme,
    Select,
    MenuItem,
    FormControl
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import type { Ticket } from '../../types';

interface TicketCardProps {
    ticket: Ticket;
    onEdit: (ticket: Ticket) => void;
    onDelete: (ticketId: number) => void;
    onReserve: (ticketId: number) => void;
    onChangeStatus: (ticketId: number, newStatus?: Ticket['status']) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
    ticket,
    onEdit,
    onDelete,
    onReserve,
    onChangeStatus
}) => {
    const theme = useTheme();
    const [statusUpdating, setStatusUpdating] = useState(false);

    const getStatusColor = (status: Ticket['status']) => {
        switch (status) {
            case 'AVAILABLE':
                return theme.palette.success.main;
            case 'SOLD_OUT':
                return theme.palette.error.main;
            case 'INACTIVE':
                return theme.palette.text.secondary;
            default:
                return theme.palette.text.secondary;
        }
    };

    const getTypeColor = (type: Ticket['type']) => {
        switch (type) {
            case 'EARLY_BIRD':
                return theme.palette.warning.main;
            case 'STANDARD':
                return theme.palette.accent.main;
            case 'VIP':
                return theme.palette.secondary.main;
            default:
                return theme.palette.primary.main;
        }
    };

    const getProgressValue = () => {
        // Assuming max quantity is 100 for progress calculation
        // In real app, you might want to track original quantity
        return Math.min((ticket.quantityAvailable / 100) * 100, 100);
    };

    const handleStatusChange = async (event: SelectChangeEvent<Ticket['status']>) => {
        const newStatus = event.target.value as Ticket['status'];
        if (newStatus === ticket.status) return;

        setStatusUpdating(true);
        try {
            // Call the onChangeStatus prop which should handle the API call
            await onChangeStatus(ticket.id, newStatus);
        } catch (error) {
            console.error('Failed to update ticket status:', error);
        } finally {
            setStatusUpdating(false);
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${getTypeColor(ticket.type)}`,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
                position: 'relative',
                overflow: 'visible'
            }}
        >
            {/* Status Indicator Dot */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(ticket.status),
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                    }
                }}
            />

            <CardContent sx={{ flex: 1, p: 3 }}>
                <Stack spacing={2}>
                    {/* Header */}
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: getTypeColor(ticket.type),
                                mb: 1
                            }}
                        >
                            {ticket.type.replace('_', ' ')}
                        </Typography>

                        {/* Status Dropdown */}
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={ticket.status}
                                onChange={handleStatusChange}
                                disabled={statusUpdating}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: getStatusColor(ticket.status),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white'
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'white'
                                    }
                                }}
                            >
                                <MenuItem value="AVAILABLE">Available</MenuItem>
                                <MenuItem value="SOLD_OUT">Sold Out</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Price */}
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            color: theme.palette.primary.main
                        }}
                    >
                        ${ticket.price.toFixed(2)}
                    </Typography>

                    {/* Quantity and Progress */}
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Available: {ticket.quantityAvailable}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={getProgressValue()}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getTypeColor(ticket.type),
                                    borderRadius: 3
                                }
                            }}
                        />
                    </Box>

                    {/* Description */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            flex: 1,
                            lineHeight: 1.5
                        }}
                    >
                        {ticket.description}
                    </Typography>

                    {/* Additional Info */}
                    <Stack direction="row" spacing={2} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        <Typography variant="caption">
                            Max per user: {ticket.maxPerUser}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>

            {/* Action Buttons */}
            <Box sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit Ticket">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(ticket)}
                            sx={{
                                color: theme.palette.accent.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.accent.main,
                                    color: 'white'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Reserve Tickets">
                        <IconButton
                            size="small"
                            onClick={() => onReserve(ticket.id)}
                            sx={{
                                color: theme.palette.success.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.success.main,
                                    color: 'white'
                                }
                            }}
                        >
                            <ShoppingCartIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>



                    <Tooltip title="Delete Ticket">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(ticket.id)}
                            sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.error.main,
                                    color: 'white'
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Card>
    );
};

export default TicketCard;
