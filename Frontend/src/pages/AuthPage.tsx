import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, Grid, TextField, Typography, Stack, IconButton, InputAdornment, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Visibility, VisibilityOff, PersonOutline, LockOutlined, MailOutline, Security, Google, Facebook } from '@mui/icons-material';
import Lottie from 'lottie-react';
import loginAnimation from '../assets/Login and Sign up.json';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

type UserRole = 'USER' | 'ADMIN';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'USER' as UserRole
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectMessage = location.state?.message;

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, role: event.target.value as UserRole }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login({ username: formData.username, password: formData.password, role: formData.role });
                if (result.success) {
                    setSuccess(result.message || 'Login successful. Redirecting you now.');
                    setTimeout(() => {
                        if (formData.role === 'ADMIN') {
                            navigate('/admin');
                        } else {
                            navigate('/events');
                        }
                    }, 1500);
                } else {
                    setError(result.message || 'Login failed. Please double-check your credentials.');
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters long.');
                    setLoading(false);
                    return;
                }
                const result = await register({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                });
                if (result.success) {
                    setSuccess('Registration successful. Redirecting you now.');
                    setTimeout(() => {
                        navigate('/events');
                    }, 1500);
                } else {
                    setError(result.message || 'Registration failed. Please try again.');
                }
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        setError(`${provider} login is coming soon.`);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={0} sx={{ minHeight: '80vh', alignItems: 'center' }}>
                    {/* Left Side - Lottie Animation */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <Lottie animationData={loginAnimation} loop autoplay />
                        </Box>
                    </Grid>

                    {/* Right Side - Form */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Card
                            sx={{
                                width: '100%',
                                maxWidth: 450,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                borderRadius: 3,
                                p: 3,
                                animation: 'fadeIn 0.5s ease-out'
                            }}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#333' }}>
                                    {isLogin ? 'Welcome Back' : 'Create Account'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
                                    {isLogin ? 'Sign in to continue managing your events and bookings.' : 'Let\'s get you set up in just a few steps.'}
                                </Typography>

                                {!isLogin && (
                                    <Stack spacing={2} mb={3}>
                                        <Button
                                            onClick={() => handleSocialLogin('Google')}
                                            variant="outlined"
                                            fullWidth
                                            startIcon={<Google />}
                                            sx={{ borderRadius: 3, py: 1.25, fontWeight: 600 }}
                                        >
                                            Continue with Google
                                        </Button>
                                        <Button
                                            onClick={() => handleSocialLogin('Facebook')}
                                            variant="outlined"
                                            fullWidth
                                            startIcon={<Facebook />}
                                            sx={{ borderRadius: 3, py: 1.25, fontWeight: 600 }}
                                        >
                                            Continue with Facebook
                                        </Button>
                                    </Stack>
                                )}

                                <Box component="form" onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        {!isLogin && (
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="First Name"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange('firstName')}
                                                        fullWidth
                                                        required
                                                        disabled={loading}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonOutline sx={{ color: '#4DA3FF' }} />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <TextField
                                                        label="Last Name"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange('lastName')}
                                                        fullWidth
                                                        required
                                                        disabled={loading}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <PersonOutline sx={{ color: '#4DA3FF' }} />
                                                                </InputAdornment>
                                                            )
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        )}

                                        <TextField
                                            label="Username"
                                            value={formData.username}
                                            onChange={handleInputChange('username')}
                                            fullWidth
                                            required
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutline sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        {!isLogin && (
                                            <TextField
                                                label="Email Address"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange('email')}
                                                fullWidth
                                                required
                                                disabled={loading}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <MailOutline sx={{ color: '#4DA3FF' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}

                                        <TextField
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange('password')}
                                            fullWidth
                                            required
                                            disabled={loading}
                                            inputProps={{ minLength: 6 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlined sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        {!isLogin && (
                                            <TextField
                                                label="Confirm Password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange('confirmPassword')}
                                                fullWidth
                                                required
                                                disabled={loading}
                                                inputProps={{ minLength: 6 }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LockOutlined sx={{ color: '#4DA3FF' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={loading}>
                                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}

                                        {isLogin && (
                                            <TextField
                                                label="Login as"
                                                value={formData.role}
                                                onChange={handleRoleChange}
                                                select
                                                fullWidth
                                                disabled={loading}
                                                required
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Security sx={{ color: '#4DA3FF' }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            >
                                                <MenuItem value="USER">User</MenuItem>
                                                <MenuItem value="ADMIN">Administrator</MenuItem>
                                            </TextField>
                                        )}

                                        {redirectMessage && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                {redirectMessage}
                                            </Alert>
                                        )}

                                        {error && (
                                            <Alert severity="error" onClose={() => setError(null)}>
                                                {error}
                                            </Alert>
                                        )}

                                        {success && (
                                            <Alert severity="success" onClose={() => setSuccess(null)}>
                                                {success}
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            disabled={loading}
                                            sx={{
                                                mt: 2,
                                                py: 1.5,
                                                backgroundColor: '#4DA3FF',
                                                '&:hover': { backgroundColor: '#3a8ce5' },
                                                borderRadius: 2
                                            }}
                                        >
                                            {loading ? <CircularProgress size={24} /> : (isLogin ? 'Sign In' : 'Create Account')}
                                        </Button>
                                    </Stack>
                                </Box>

                                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: '#666' }}>
                                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                    <Button
                                        onClick={() => setIsLogin(!isLogin)}
                                        sx={{ textTransform: 'none', fontWeight: 600, color: '#4DA3FF' }}
                                    >
                                        {isLogin ? 'Create Account' : 'Log in'}
                                    </Button>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AuthPage;
