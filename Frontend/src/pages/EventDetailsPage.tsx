import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TicketBooking from '../components/tickets/TicketBooking';

const EventDetailsPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    if (!eventId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography>Invalid event ID</Typography>
            </Box>
        );
    }

    const eventIdNumber = parseInt(eventId, 10);
    if (isNaN(eventIdNumber)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography>Invalid event ID</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0B1020 0%, #1a1f35 50%, #0B1020 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/events')}
                        sx={{
                            color: '#E6F0FF',
                            '&:hover': {
                                backgroundColor: 'rgba(15, 98, 254, 0.1)',
                            }
                        }}
                    >
                        Back to Events
                    </Button>
                </Box>

                {/* Ticket Booking Component */}
                <TicketBooking eventId={eventIdNumber} />
            </Container>
        </Box>
    );
};

export default EventDetailsPage;
