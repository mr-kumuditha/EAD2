 import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import type { User } from '../../types';
import type { UpdateUserRequest } from '../../services/userService';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userId: number, userData: UpdateUserRequest) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    user: User | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    error = null,
    user
}) => {
    const [formData, setFormData] = useState<UpdateUserRequest>({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: 'USER'
    });
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                username: user.username,
                email: user.email,
                role: user.role
            });
            setValidationError(null);
        }
    }, [isOpen, user]);

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user) return;

        // Basic validation
        if (!formData.username?.trim() || !formData.email?.trim()) {
            setValidationError('Username and email are required');
            return;
        }

        if (!formData.email?.includes('@')) {
            setValidationError('Please enter a valid email address');
            return;
        }

        setValidationError(null);

        try {
            await onSubmit(user.userId, formData);
            onClose();
        } catch {
            // Error is handled by parent component
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Edit User
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Update user information and permissions
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 1 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleFieldChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleFieldChange}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleFieldChange}
                                variant="outlined"
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFieldChange}
                                variant="outlined"
                                size="small"
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                select
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={handleFieldChange}
                                variant="outlined"
                                size="small"
                            >
                                <MenuItem value="USER">User</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    {(validationError || error) && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            {validationError || error}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} disabled={loading} variant="outlined">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EditUserModal;
