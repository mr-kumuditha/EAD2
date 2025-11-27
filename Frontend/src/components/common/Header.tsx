import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AccountCircle, Menu as MenuIcon, AdminPanelSettings, Event, Logout, Person, ConfirmationNumber as TicketIcon } from '@mui/icons-material';
import { useAuth } from '../../context/useAuth';
import MusicPlayer from './MusicPlayer';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const isTransparent = isHomePage && !isScrolled;

    return (
        <AppBar
            position="fixed"
            elevation={isTransparent ? 0 : 2}
            sx={{
                backgroundColor: isTransparent ? 'transparent' : (isHomePage ? '#F9F9F9' : '#F9F9F9'),
                backdropFilter: isTransparent ? 'none' : 'blur(10px)',
                borderBottom: isTransparent ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isTransparent ? 'none' : '0 2px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                width: '100%',
                zIndex: 1100,
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 75 }}>
                    <Typography
                        component={RouterLink}
                        to="/"
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            textDecoration: 'none',
                            background: 'linear-gradient(135deg, #4DA3FF 0%, #836FFF 50%, #54D3A9 100%)',
                            backgroundSize: '200% 200%',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.8rem',
                            letterSpacing: '-0.02em',
                            fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                            animation: 'gradientShift 3s ease-in-out infinite',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                textDecoration: 'underline',
                                textDecorationThickness: '2px',
                                textUnderlineOffset: '4px',
                            },
                            '@keyframes gradientShift': {
                                '0%': { backgroundPosition: '0% 50%' },
                                '50%': { backgroundPosition: '100% 50%' },
                                '100%': { backgroundPosition: '0% 50%' },
                            },
                        }}
                    >
                        EVENTHUB
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <MusicPlayer />

                        {/* Navigation Links */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Button
                                component={RouterLink}
                                to="/"
                                sx={{
                                    color: isTransparent ? 'white' : '#333C4F',
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                        color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                        textDecoration: 'underline',
                                        textDecorationThickness: '2px',
                                        textUnderlineOffset: '4px',
                                    },
                                }}
                            >
                                Home
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/about"
                                sx={{
                                    color: isTransparent ? 'white' : '#333C4F',
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                        color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                        textDecoration: 'underline',
                                        textDecorationThickness: '2px',
                                        textUnderlineOffset: '4px',
                                    },
                                }}
                            >
                                About
                            </Button>
                        </Stack>

                        {user ? (
                            <>
                                {/* Mobile Hamburger Menu */}
                                <IconButton
                                    onClick={handleMenuOpen}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        color: isTransparent ? 'white' : '#333C4F',
                                        '&:hover': {
                                            backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    <MenuIcon />
                                </IconButton>

                                {/* Desktop Navigation */}
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                                    <Button
                                        component={RouterLink}
                                        to="/events"
                                        sx={{
                                            color: isTransparent ? 'white' : '#333C4F',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                                color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                                textDecoration: 'underline',
                                                textDecorationThickness: '2px',
                                                textUnderlineOffset: '4px',
                                            },
                                        }}
                                    >
                                        <Event sx={{ mr: 1, fontSize: 20 }} />
                                        Events
                                    </Button>

                                    <Button
                                        component={RouterLink}
                                        to="/my-bookings"
                                        sx={{
                                            color: isTransparent ? 'white' : '#333C4F',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                                color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                                textDecoration: 'underline',
                                                textDecorationThickness: '2px',
                                                textUnderlineOffset: '4px',
                                            },
                                        }}
                                    >
                                        <TicketIcon sx={{ mr: 1, fontSize: 20 }} />
                                        My Bookings
                                    </Button>

                                    {user.role === 'ADMIN' && (
                                        <Button
                                            component={RouterLink}
                                            to="/admin"
                                            sx={{
                                                color: isTransparent ? 'white' : '#333C4F',
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1.5,
                                                borderRadius: 2,
                                                fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                                    color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                                    textDecoration: 'underline',
                                                    textDecorationThickness: '2px',
                                                    textUnderlineOffset: '4px',
                                                },
                                            }}
                                        >
                                            <AdminPanelSettings sx={{ mr: 1, fontSize: 20 }} />
                                            Admin
                                        </Button>
                                    )}

                                    <IconButton
                                        onClick={handleMenuOpen}
                                        sx={{
                                            color: isTransparent ? 'white' : '#333C4F',
                                            ml: 1,
                                            '&:hover': {
                                                backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                            },
                                        }}
                                    >
                                        <AccountCircle sx={{ fontSize: 28 }} />
                                    </IconButton>
                                </Stack>

                                {/* User Menu */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        sx: {
                                            mt: 1.5,
                                            minWidth: 200,
                                            borderRadius: 2,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    <MenuItem disabled sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
                                        <Person sx={{ mr: 1.5, fontSize: 18 }} />
                                        {user.firstName || user.username}
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/" sx={{ py: 1.5 }}>
                                        Home
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/events" sx={{ py: 1.5 }}>
                                        <Event sx={{ mr: 1.5, fontSize: 18 }} />
                                        Browse Events
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/my-bookings" sx={{ py: 1.5 }}>
                                        <TicketIcon sx={{ mr: 1.5, fontSize: 18 }} />
                                        My Bookings
                                    </MenuItem>
                                    <MenuItem onClick={handleMenuClose} component={RouterLink} to="/about" sx={{ py: 1.5 }}>
                                        About
                                    </MenuItem>
                                    {user.role === 'ADMIN' && (
                                        <MenuItem onClick={handleMenuClose} component={RouterLink} to="/admin" sx={{ py: 1.5 }}>
                                            <AdminPanelSettings sx={{ mr: 1.5, fontSize: 18 }} />
                                            Admin Dashboard
                                        </MenuItem>
                                    )}
                                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                                        <Logout sx={{ mr: 1.5, fontSize: 18 }} />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button
                                    component={RouterLink}
                                    to="/events"
                                    sx={{
                                        color: isTransparent ? 'white' : '#333C4F',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.5,
                                        borderRadius: 2,
                                        mr: 1,
                                        fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                            color: isTransparent ? '#FFFFFF' : '#4DA3FF',
                                            textDecoration: 'underline',
                                            textDecorationThickness: '2px',
                                            textUnderlineOffset: '4px',
                                        },
                                    }}
                                >
                                    Browse Events
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/auth"
                                    variant="contained"
                                    sx={{
                                        background: 'linear-gradient(135deg, #4DA3FF 0%, #836FFF 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                        boxShadow: '0 4px 16px rgba(77, 163, 255, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #3a8ce5 0%, #6b5ce7 100%)',
                                            transform: 'translateY(-2px) scale(1.05)',
                                            boxShadow: '0 6px 20px rgba(77, 163, 255, 0.4)',
                                        },
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/auth"
                                    variant="outlined"
                                    sx={{
                                        color: isTransparent ? 'white' : '#4DA3FF',
                                        borderColor: isTransparent ? 'white' : '#4DA3FF',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontFamily: "'Inter', 'Montserrat', 'Poppins', sans-serif",
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: isTransparent ? 'rgba(255, 255, 255, 0.1)' : '#4DA3FF',
                                            color: 'white',
                                            transform: 'translateY(-2px) scale(1.05)',
                                            borderColor: '#4DA3FF',
                                        },
                                    }}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
