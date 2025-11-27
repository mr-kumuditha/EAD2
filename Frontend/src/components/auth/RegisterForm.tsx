import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutline from '@mui/icons-material/PersonOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/Login and Sign up.json';
import { useNavigate } from 'react-router-dom';
import type { TextFieldProps } from '@mui/material/TextField';
import { useAuth } from '../../context/useAuth';
import { authService } from '../../services/authService';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register, login } = useAuth();

    const textFieldStyles: TextFieldProps['sx'] = useMemo(
        () => ({
            '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                px: 1.5
            }
        }),
        []
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const validateForm = () => {
        if (!agreed) {
            setError('Please agree to the Terms & Conditions and Privacy Policy.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (!result.success) {
                setError(result.message || 'Registration failed. Please try again.');
                setLoading(false);
                return;
            }

            const loginResult = await login({
                username: formData.username,
                password: formData.password,
                role: 'USER'
            });

            if (!loginResult.success) {
                navigate('/auth', { replace: true });
                return;
            }

            const currentUser = authService.getCurrentUser();
            const destination = currentUser?.role === 'ADMIN' ? '/admin' : '/events';
            navigate(destination, { replace: true });
        } catch (registerError: unknown) {
            const message = registerError instanceof Error ? registerError.message : String(registerError);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = (provider: string) => {
        setError(`${provider} registration is coming soon.`);
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
                                    Create Account
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
                                    Let's get you set up in just a few steps.
                                </Typography>

                                <Stack spacing={2} mb={3}>
                                    <Button
                                        onClick={() => handleSocialRegister('Google')}
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<GoogleIcon />}
                                        sx={{ borderRadius: 3, py: 1.25, fontWeight: 600 }}
                                    >
                                        Continue with Google
                                    </Button>
                                    <Button
                                        onClick={() => handleSocialRegister('Facebook')}
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
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    id="firstName"
                                                    label="First Name"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    fullWidth
                                                    disabled={loading}
                                                    sx={textFieldStyles}
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
                                                    id="lastName"
                                                    label="Last Name"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    fullWidth
                                                    disabled={loading}
                                                    sx={textFieldStyles}
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

                                        <TextField
                                            id="username"
                                            label="Username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                            disabled={loading}
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
                                            id="email"
                                            label="Email Address"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                            disabled={loading}
                                            sx={textFieldStyles}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <MailOutline sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        <TextField
                                            id="password"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                            disabled={loading}
                                            sx={textFieldStyles}
                                            inputProps={{ minLength: 6 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlined sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" disabled={loading}>
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        <TextField
                                            id="confirmPassword"
                                            label="Confirm Password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            fullWidth
                                            disabled={loading}
                                            sx={textFieldStyles}
                                            inputProps={{ minLength: 6 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockOutlined sx={{ color: '#4DA3FF' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end" disabled={loading}>
                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={agreed}
                                                    onChange={(event) => setAgreed(event.target.checked)}
                                                    disabled={loading}
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" color="text.secondary">
                                                    I agree to the{' '}
                                                    <Button type="button" size="small" sx={{ textTransform: 'none', fontWeight: 600, px: 0 }}>
                                                        Terms &amp; Conditions
                                                    </Button>{' '}
                                                    and{' '}
                                                    <Button type="button" size="small" sx={{ textTransform: 'none', fontWeight: 600, px: 0 }}>
                                                        Privacy Policy
                                                    </Button>
                                                </Typography>
                                            }
                                        />

                                        {error && (
                                            <Alert severity="error" onClose={() => setError(null)}>
                                                {error}
                                            </Alert>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, backgroundColor: '#4DA3FF', '&:hover': { backgroundColor: '#3a8ce5' } }}
                                            fullWidth
                                        >
                                            {loading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
                                        </Button>
                                    </Stack>
                                </Box>

                                <Divider sx={{ my: 4 }} />

                                <Stack direction="row" justifyContent="center" spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Already have an account?
                                    </Typography>
                                    <Button
                                        onClick={onSwitchToLogin}
                                        variant="text"
                                        size="small"
                                        sx={{ textTransform: 'none', fontWeight: 600, color: '#4DA3FF' }}
                                        disabled={loading}
                                    >
                                        Log in
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

export default RegisterForm;