import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider, IconButton, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.main',
                color: 'white',
                mt: 'auto',
                py: 6
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Company Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                            EVENTHUB
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                            Your premier destination for discovering and booking amazing events. From intimate gatherings to massive festivals, we connect you with unforgettable experiences.
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                className="social-icon"
                                sx={{
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'accent.main', color: 'primary.main' }
                                }}
                                component="a"
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Facebook />
                            </IconButton>
                            <IconButton
                                className="social-icon"
                                sx={{
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'accent.main', color: 'primary.main' }
                                }}
                                component="a"
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Twitter />
                            </IconButton>
                            <IconButton
                                className="social-icon"
                                sx={{
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'accent.main', color: 'primary.main' }
                                }}
                                component="a"
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Instagram />
                            </IconButton>
                            <IconButton
                                className="social-icon"
                                sx={{
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'accent.main', color: 'primary.main' }
                                }}
                                component="a"
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <LinkedIn />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                            Quick Links
                        </Typography>
                        <Stack spacing={1}>
                            <Link component={RouterLink} to="/events" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Browse Events
                            </Link>
                            <Link component={RouterLink} to="/about" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                About Us
                            </Link>
                            <Link component={RouterLink} to="/contact" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Contact
                            </Link>
                            <Link component={RouterLink} to="/careers" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Careers
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Support */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                            Support
                        </Typography>
                        <Stack spacing={1}>
                            <Link component={RouterLink} to="/help" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Help Center
                            </Link>
                            <Link component={RouterLink} to="/faq" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                FAQ
                            </Link>
                            <Link component={RouterLink} to="/privacy" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Privacy Policy
                            </Link>
                            <Link component={RouterLink} to="/terms" sx={{ color: 'white', textDecoration: 'none', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                                Terms of Service
                            </Link>
                        </Stack>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                            Get in Touch
                        </Typography>
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Email sx={{ color: 'accent.main' }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    support@eventhub.com
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Phone sx={{ color: 'accent.main' }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    +1 (555) 123-4567
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="flex-start" spacing={1}>
                                <LocationOn sx={{ color: 'accent.main', mt: 0.5 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    123 Event Street<br />
                                    San Francisco, CA 94105
                                </Typography>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.2)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        © {new Date().getFullYear()} EventHub. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                            Cookie Policy
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                            Accessibility
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                            Sitemap
                        </Typography>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
