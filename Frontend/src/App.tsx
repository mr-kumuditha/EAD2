import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminPage from './pages/AdminPage';
import ConnectionTest from './pages/ConnectionTest';
import PaymentPage from './pages/PaymentPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './App.css';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                    <Header />
                    <Box component="main" sx={{ flex: 1, py: { xs: 2, md: 4 } }}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/:eventId" element={<EventDetailsPage />} />
                            <Route path="/payment" element={<PaymentPage />} />
                            <Route path="/my-bookings" element={<MyBookingsPage />} />
                            <Route path="/my-bookings/:bookingRef" element={<BookingDetailsPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                            <Route path="/connection-test" element={<ConnectionTest />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Box>
                    <Footer />
                </Box>
            </Router>
        </AuthProvider>
    );
};

export default App;