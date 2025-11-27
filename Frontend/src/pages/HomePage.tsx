
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack, Card, CardContent, IconButton, TextField, Avatar, Paper, Grid } from '@mui/material';
import { Email, Star, Group, LocationOn, Search, LocalActivity } from '@mui/icons-material';
import EventCalendar from '../components/common/EventCalendar';
import heroImage from '../assets/yakin 19.jpg';

// Add keyframes for color cycling animation
const styles = `
@keyframes colorCycle {
    0%, 100% { color: #FF0000; }
    33% { color: #FFD700; }
    66% { color: #000000; }
}
`;

// Inject styles into head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const HomePage: React.FC = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter signup
        console.log('Newsletter signup:', email);
        setEmail('');
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            {/* Full-Screen Hero Section */}
            <Box
                sx={{
                    minHeight: '100vh',
                    height: '100vh',
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    width: '100vw',
                    left: '50%',
                    right: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                    marginTop: '-75px',
                    paddingTop: '75px',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(31, 42, 68, 0.7)',
                        zIndex: 1,
                    },
                }}
            >
                {/* Spacer for fixed header */}
                <Box sx={{ height: 75, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }} />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            fontWeight: 700,
                            mb: 3,
                            fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                            letterSpacing: '0.02em',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                            animation: 'fadeInUp 1s ease-out',
                        }}
                    >
                        {'Discover & Book Events You Love'.split('').map((letter, index) => (
                            <Box
                                key={index}
                                component="span"
                                sx={{
                                    display: 'inline-block',
                                    animation: `colorCycle 3s ease-in-out infinite`,
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                {letter === ' ' ? '\u00A0' : letter}
                            </Box>
                        ))}
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            fontSize: { xs: '1.1rem', md: '1.5rem' },
                            mb: 4,
                            color: '#A8B0C3',
                            maxWidth: 700,
                            mx: 'auto',
                            lineHeight: 1.6,
                            animation: 'fadeInUp 1s ease-out 0.2s both',
                        }}
                    >
                        Concerts, Workshops, Sports, VIP — Your Ticket to Unforgettable Experiences
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        sx={{
                            animation: 'fadeInUp 1s ease-out 0.4s both',
                        }}
                    >
                        <Button
                            component={Link}
                            to="/events"
                            variant="contained"
                            size="large"
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4DA3FF 0%, #836FFF 100%)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(77, 163, 255, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #3a8ce5 0%, #6b5ce7 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 40px rgba(77, 163, 255, 0.4)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Explore Events
                        </Button>
                        <Button
                            component={Link}
                            to="/auth"
                            variant="outlined"
                            size="large"
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                borderColor: '#836FFF',
                                color: '#836FFF',
                                borderRadius: 3,
                                '&:hover': {
                                    borderColor: '#6b5ce7',
                                    backgroundColor: 'rgba(131, 111, 255, 0.1)',
                                    color: '#6b5ce7',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Create an Account
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: 'text.primary',
                        }}
                    >
                        Why Choose EventHub?
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 600,
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Discover the features that make EventHub the ultimate platform for event discovery and booking.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <IconButton
                                sx={{
                                    mb: 3,
                                    backgroundColor: 'accent.main',
                                    color: 'white',
                                    width: 80,
                                    height: 80,
                                    '&:hover': { backgroundColor: 'accent.dark' },
                                }}
                            >
                                <Search sx={{ fontSize: 32 }} />
                            </IconButton>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                    Browse Events
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    Find concerts, workshops, and sports events near you with our advanced search and filtering system.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <IconButton
                                sx={{
                                    mb: 3,
                                    backgroundColor: 'accent.main',
                                    color: 'white',
                                    width: 80,
                                    height: 80,
                                    '&:hover': { backgroundColor: 'accent.dark' },
                                }}
                            >
                                <LocalActivity sx={{ fontSize: 32 }} />
                            </IconButton>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                    Book Tickets
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    Select your seat & ticket type quickly and safely with our secure payment processing.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <IconButton
                                sx={{
                                    mb: 3,
                                    backgroundColor: 'warning.main',
                                    color: 'white',
                                    width: 80,
                                    height: 80,
                                    '&:hover': { backgroundColor: '#e5a500' },
                                }}
                            >
                                <Star sx={{ fontSize: 32 }} />
                            </IconButton>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                    VIP Access
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    Enjoy exclusive experiences and perks with VIP tickets, highlighted with our signature gold badge.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Statistics Section */}
            <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: 'text.primary',
                            }}
                        >
                            EventHub by the Numbers
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Join thousands of event enthusiasts who trust EventHub for their event experiences.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: 'accent.main', fontWeight: 700, mb: 1 }}>
                                    500+
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    Events Hosted
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    From intimate gatherings to massive festivals
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700, mb: 1 }}>
                                    20K+
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    Tickets Sold
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Happy attendees discovering new adventures
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>
                                    100+
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    VIP Experiences
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Exclusive perks and premium access
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 700, mb: 1 }}>
                                    99%
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    Customer Satisfaction
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Based on attendee reviews and feedback
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Upcoming Events Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: 'text.primary',
                        }}
                    >
                        Featured Events
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 600,
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Don't miss out on these amazing upcoming events. Book your tickets now and be part of something special.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper
                            sx={{
                                p: 4,
                                backgroundColor: 'background.paper',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: 'text.primary' }}>
                                This Month's Highlights
                            </Typography>
                            <Stack spacing={3}>
                                {[
                                    { date: '15 Dec', title: 'Tech Conference 2024', location: 'San Francisco, CA', attendees: 1200, vip: true },
                                    { date: '22 Dec', title: 'Winter Music Festival', location: 'Austin, TX', attendees: 850, vip: false },
                                    { date: '28 Dec', title: 'New Year\'s Eve Gala', location: 'New York, NY', attendees: 500, vip: true },
                                ].map((event, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 3,
                                            borderRadius: 2,
                                            backgroundColor: 'background.default',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                transform: 'translateX(8px)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                backgroundColor: 'accent.main',
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                mr: 3,
                                                position: 'relative',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {event.date.split(' ')[0]}
                                            </Typography>
                                            <Typography variant="caption">
                                                {event.date.split(' ')[1]}
                                            </Typography>
                                            {event.vip && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        backgroundColor: 'warning.main',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: 24,
                                                        height: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    V
                                                </Box>
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                                {event.title}
                                            </Typography>
                                            <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {event.location}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {event.attendees} attending
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                            {event.vip && (
                                                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                                                    VIP Experience Available
                                                </Typography>
                                            )}
                                        </Box>
                                        <Button
                                            component={Link}
                                            to="/events"
                                            variant="contained"
                                            sx={{
                                                borderRadius: 2,
                                                px: 3,
                                                backgroundColor: event.vip ? 'warning.main' : 'accent.main',
                                                '&:hover': {
                                                    backgroundColor: event.vip ? '#e5a500' : 'accent.dark',
                                                },
                                            }}
                                        >
                                            {event.vip ? 'Get VIP' : 'Book Now'}
                                        </Button>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <EventCalendar compact={true} showNavigation={false} />
                    </Grid>
                </Grid>
            </Container>

            {/* Testimonials Section */}
            <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: 'text.primary',
                            }}
                        >
                            What Our Community Says
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Real experiences from event attendees who discovered their next adventure with EventHub.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Event Organizer',
                                avatar: 'SJ',
                                rating: 5,
                                review: 'EventHub made organizing my conference seamless. The platform is intuitive and the support team is exceptional.',
                            },
                            {
                                name: 'Mike Chen',
                                role: 'Regular Attendee',
                                avatar: 'MC',
                                rating: 5,
                                review: 'I\'ve discovered so many amazing events through EventHub. The recommendations are spot-on and booking is effortless.',
                            },
                            {
                                name: 'Emma Rodriguez',
                                role: 'Music Festival Goer',
                                avatar: 'ER',
                                rating: 5,
                                review: 'The calendar feature helps me plan my entire month. Never miss an event again thanks to EventHub!',
                            },
                        ].map((testimonial, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        p: 4,
                                        borderRadius: 3,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                        },
                                    }}
                                >
                                    <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                                        ))}
                                    </Stack>
                                    <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}>
                                        "{testimonial.review}"
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ backgroundColor: 'accent.main', color: 'white', width: 48, height: 48 }}>
                                            {testimonial.avatar}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                {testimonial.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {testimonial.role}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Call-to-Action Section */}
            <Box sx={{ background: 'linear-gradient(135deg, #4DA3FF 0%, #836FFF 100%)', py: 8, color: 'white' }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 3, fontWeight: 700 }}>
                        Ready to Experience Unforgettable Events?
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                        Join thousands of event enthusiasts and discover your next adventure today.
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        sx={{
                            '& .MuiButton-root': {
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                            },
                        }}
                    >
                        <Button
                            component={Link}
                            to="/events"
                            variant="contained"
                            sx={{
                                backgroundColor: 'white',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                },
                            }}
                        >
                            Explore Events Now
                        </Button>
                        <Button
                            component={Link}
                            to="/auth"
                            variant="outlined"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': {
                                    borderColor: '#f5f5f5',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            Sign Up Free
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Newsletter Signup */}
            <Box sx={{ backgroundColor: 'background.paper', py: 8 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                        Stay in the Loop
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
                        Get the latest event updates, exclusive deals, and insider tips delivered to your inbox.
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleNewsletterSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            maxWidth: 500,
                            mx: 'auto',
                        }}
                    >
                        <TextField
                            fullWidth
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    backgroundColor: 'background.default',
                                },
                            }}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<Email />}
                            sx={{
                                px: 4,
                                py: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                backgroundColor: 'accent.main',
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: 'accent.dark',
                                    transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Subscribe
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        No spam, unsubscribe at any time.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;
