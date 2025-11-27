import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Security from '@mui/icons-material/Security';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/Login and Sign up.json';
import type { TextFieldProps } from '@mui/material/TextField';
import { useAuth } from '../../context/useAuth';

type UserRole = 'USER' | 'ADMIN';

interface LoginFormProps {
    onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('USER');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const textFieldStyles: TextFieldProps['sx'] = useMemo(
        () => ({
            '& .MuiOutlinedInput-root': {
                borderRadius: 3
            }
        }),
        []
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const result = await login({ username, password, role });

            if (result.success) {
                setSuccess(result.message || 'Login successful. Redirecting you now.');
                // Redirect based on role after successful login
                setTimeout(() => {
                    if (role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/events');
                    }
                }, 1500); // Small delay to show success message
            } else {
                setError(result.message || 'Login failed. Please double-check your credentials.');
            }
        } catch (loginError: unknown) {
            const message = loginError instanceof Error ? loginError.message : String(loginError);
            setError(message);
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
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
                                    Sign in to continue managing your events and bookings.
                                </Typography>

                                <Stack spacing={2} mb={3}>
                                    <Button
                                        onClick={() => handleSocialLogin('Google')}
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<GoogleIcon />}
                                        sx={{ borderRadius: 3, py: 1.25, fontWeight: 600 }}
                                    >
                                        Continue with Google
                                    </Button>
                                    <Button
                                        onClick={() => handleSocialLogin('Facebook')}
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<FacebookIcon />}
                                        sx={{ borderRadius: 3, py: 1.25, fontWeight: 600 }}
                                    >
                                        Continue with Facebook
                                    </Button>
                                </Stack>

                                <Divider sx={{ my: 4 }}>or</Divider>

                                <Box component="form" onSubmit={handleSubmit} noValidate>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="Username"
                                            name="username"
                                            value={username}
                                            onChange={(event) => setUsername(event.target.value)}
                                            fullWidth
                                            disabled={loading}
                                            required
                                            sx={textFieldStyles}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutline sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <TextField
                                            label="Password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            fullWidth
                                            disabled={loading}
                                            required
                                            sx={textFieldStyles}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlined sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword((prev) => !prev)}
                                                            edge="end"
                                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                            disabled={loading}
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <TextField
                                            label="Login as"
                                            name="role"
                                            value={role}
                                            onChange={(event) => setRole(event.target.value as UserRole)}
                                            select
                                            fullWidth
                                            disabled={loading}
                                            required
                                            sx={textFieldStyles}
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

                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                                            <Button
                                                type="button"
                                                variant="text"
                                                size="small"
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Forgot your password?
                                            </Button>
                                        </Stack>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, backgroundColor: '#4DA3FF', '&:hover': { backgroundColor: '#3a8ce5' } }}
                                            fullWidth
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                        </Button>
                                    </Stack>
                                </Box>

                                <Divider sx={{ my: 4 }} />

                                <Stack direction="row" justifyContent="center" spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Don&apos;t have an account?
                                    </Typography>
                                    <Button
                                        onClick={onSwitchToRegister}
                                        variant="text"
                                        size="small"
                                        sx={{ textTransform: 'none', fontWeight: 600, color: '#4DA3FF' }}
                                        disabled={loading}
                                    >
                                        Create Account
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LoginForm;