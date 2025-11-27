import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Typography, Stack, Card, CardContent, Avatar, Grid } from '@mui/material';
import { Search, LocalActivity, Star, Group, Star as StarIcon } from '@mui/icons-material';
import aboutBg from '../assets/about-bg.jpg';
import aboutReels from '../assets/aboutReels.mp4';

const AboutPage: React.FC = () => {
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F6FA' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    minHeight: '60vh',
                    backgroundImage: `linear-gradient(rgba(31, 42, 68, 0.8), rgba(31, 42, 68, 0.8)), url(${aboutBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    py: 8,
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '3rem', md: '4rem' },
                            fontWeight: 700,
                            mb: 3,
                            fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                            animation: 'fadeInUp 1s ease-out',
                        }}
                    >
                        About EventHub
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            mb: 4,
                            fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                            animation: 'fadeInUp 1s ease-out 0.2s both',
                        }}
                    >
                        Connecting You to Unforgettable Experiences
                    </Typography>
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
                            backgroundColor: '#4DA3FF',
                            borderRadius: 3,
                            '&:hover': {
                                backgroundColor: '#3a8ce5',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                            animation: 'fadeInUp 1s ease-out 0.4s both',
                        }}
                    >
                        Explore Events
                    </Button>
                </Container>
            </Box>

            {/* Our Story Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            component="video"
                            src={aboutReels}
                            controls
                            muted
                            loop
                            autoPlay
                            sx={{
                                width: '100%',
                                maxHeight: '476px',
                                objectFit: 'cover',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                animation: 'slideInLeft 1s ease-out',
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 4,
                                color: '#333C4F',
                                fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                                animation: 'fadeInUp 1s ease-out',
                            }}
                        >
                            Our Story
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                color: '#333C4F',
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                animation: 'fadeInUp 1s ease-out 0.2s both',
                            }}
                        >
                            Founded to bring people together through memorable events, EventHub started as a simple idea to make event discovery and booking effortless. Our founders, passionate about creating connections, built a platform that empowers event organizers and attendees alike.
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                mb: 2,
                                color: '#4DA3FF',
                                animation: 'fadeInUp 1s ease-out 0.4s both',
                            }}
                        >
                            Our Mission
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 3,
                                color: '#333C4F',
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                animation: 'fadeInUp 1s ease-out 0.6s both',
                            }}
                        >
                            To make event discovery and booking seamless, fun, and reliable for everyone.
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                mb: 2,
                                color: '#836FFF',
                                animation: 'fadeInUp 1s ease-out 0.8s both',
                            }}
                        >
                            Our Vision
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#333C4F',
                                lineHeight: 1.7,
                                fontSize: '1.1rem',
                                animation: 'fadeInUp 1s ease-out 1s both',
                            }}
                        >
                            To become the go-to platform for all types of events across the globe, fostering communities and creating lasting memories.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>

            {/* Features Section */}
            <Box sx={{ backgroundColor: 'white', py: 8 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: '#333C4F',
                                fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                            }}
                        >
                            What We Offer
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#A8B0C3',
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Discover the features that make EventHub the ultimate platform for event discovery and booking.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
                                <Search
                                    sx={{
                                        fontSize: 48,
                                        color: '#4DA3FF',
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333C4F' }}>
                                        Browse Thousands of Events
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#A8B0C3', lineHeight: 1.6 }}>
                                        Find concerts, workshops, and sports events near you with our advanced search and filtering system.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
                                <LocalActivity
                                    sx={{
                                        fontSize: 48,
                                        color: '#836FFF',
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333C4F' }}>
                                        Secure Ticket Booking
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#A8B0C3', lineHeight: 1.6 }}>
                                        Select your seat & ticket type quickly and safely with our secure payment processing.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
                                <Star
                                    sx={{
                                        fontSize: 48,
                                        color: '#FFB84C',
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333C4F' }}>
                                        VIP Experiences
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#A8B0C3', lineHeight: 1.6 }}>
                                        Enjoy exclusive experiences and perks with VIP tickets, highlighted with our signature gold badge.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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
                                <Group
                                    sx={{
                                        fontSize: 48,
                                        color: '#54D3A9',
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#333C4F' }}>
                                        Real-Time Notifications
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#A8B0C3', lineHeight: 1.6 }}>
                                        Stay updated with real-time availability and notifications for your favorite events.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Team Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: '#333C4F',
                            fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                        }}
                    >
                        Meet Our Team
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#A8B0C3',
                            maxWidth: 600,
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        The passionate individuals behind EventHub, dedicated to creating unforgettable experiences.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {[
                        { name: 'Alex Johnson', role: 'CEO & Founder', bio: 'Passionate about connecting people through events.', avatar: 'AJ' },
                        { name: 'Maria Garcia', role: 'CTO', bio: 'Tech enthusiast building seamless user experiences.', avatar: 'MG' },
                        { name: 'David Chen', role: 'Head of Events', bio: 'Event organizer with 10+ years of experience.', avatar: 'DC' },
                        { name: 'Sarah Williams', role: 'Marketing Director', bio: 'Creative mind driving EventHub\'s growth.', avatar: 'SW' },
                    ].map((member, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        backgroundColor: '#4DA3FF',
                                        color: 'white',
                                        fontSize: '2rem',
                                        fontWeight: 700,
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': { transform: 'scale(1.1)' },
                                    }}
                                >
                                    {member.avatar}
                                </Avatar>
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#333C4F' }}>
                                        {member.name}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#4DA3FF', fontWeight: 500 }}>
                                        {member.role}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#A8B0C3', lineHeight: 1.6 }}>
                                        {member.bio}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Testimonials Section */}
            <Box sx={{ backgroundColor: 'white', py: 8 }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                color: '#333C4F',
                                fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
                            }}
                        >
                            What Our Community Says
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#A8B0C3',
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
                                name: 'Emma Rodriguez',
                                role: 'Music Festival Goer',
                                review: 'The calendar feature helps me plan my entire month. Never miss an event again thanks to EventHub!',
                                rating: 5,
                                avatar: 'ER',
                            },
                            {
                                name: 'Mike Chen',
                                role: 'Regular Attendee',
                                review: 'I\'ve discovered so many amazing events through EventHub. The recommendations are spot-on and booking is effortless.',
                                rating: 5,
                                avatar: 'MC',
                            },
                            {
                                name: 'Sarah Johnson',
                                role: 'Event Organizer',
                                review: 'EventHub made organizing my conference seamless. The platform is intuitive and the support team is exceptional.',
                                rating: 5,
                                avatar: 'SJ',
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
                                            <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                                        ))}
                                    </Stack>
                                    <Typography variant="body1" sx={{ mb: 4, color: '#A8B0C3', fontStyle: 'italic', lineHeight: 1.6 }}>
                                        "{testimonial.review}"
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar sx={{ backgroundColor: '#4DA3FF', color: 'white', width: 48, height: 48 }}>
                                            {testimonial.avatar}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333C4F' }}>
                                                {testimonial.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#A8B0C3' }}>
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
                        Ready to Join Thousands of Event-Goers?
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                        Join thousands of event enthusiasts and discover your next adventure today.
                    </Typography>
                    <Button
                        component={Link}
                        to="/events"
                        variant="contained"
                        size="large"
                        sx={{
                            backgroundColor: 'white',
                            color: '#1F2A44',
                            px: 6,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                                transform: 'translateY(-2px) scale(1.05)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                            },
                        }}
                    >
                        Explore Events Now
                    </Button>
                </Container>
            </Box>
        </Box>
    );
};

export default AboutPage;
