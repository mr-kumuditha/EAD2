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
    IconButton,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import type { CreateEventRequest } from '../../types';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEventRequest) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    categories: string[];
}

const EMPTY_FORM: CreateEventRequest = {
    name: '',
    description: '',
    category: '',
    location: '',
    date: '',
    status: 'ACTIVE',
    image: undefined
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    error = null,
    categories
}) => {
    const [formData, setFormData] = useState<CreateEventRequest>(EMPTY_FORM);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...EMPTY_FORM,
                category: categories[0] ?? ''
            });
            setValidationError(null);
            setSelectedImage(null);
            setImagePreview(null);
        }
    }, [isOpen, categories]);

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setFormData((prev) => ({ ...prev, image: file }));

            // Create image preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, image: undefined }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError(null);

        const trimmedData = {
            ...formData,
            name: formData.name.trim(),
            description: formData.description.trim(),
            category: formData.category.trim(),
            location: formData.location.trim(),
            date: formData.date.trim()
        };

        if (!trimmedData.name || !trimmedData.description || !trimmedData.category || !trimmedData.location || !trimmedData.status) {
            setValidationError('Please complete all fields before submitting.');
            return;
        }

        if (!trimmedData.date) {
            setValidationError('Please choose a date and time for the event.');
            return;
        }

        const parsedDate = Date.parse(trimmedData.date);
        if (Number.isNaN(parsedDate)) {
            setValidationError('Please provide a valid date and time.');
            return;
        }

        const payload: CreateEventRequest = {
            ...trimmedData,
            date: new Date(parsedDate).toISOString().slice(0, 19)
        };

        try {
            await onSubmit(payload);
            onClose();
        } catch (submitError) {
            console.error('Create event submission failed:', submitError);
        }
    };

    return (
        <Dialog open={isOpen} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ fontWeight: 600 }}>Create Event</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Event Name"
                                name="name"
                                value={formData.name}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading || categories.length === 0}
                                required
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                label="Date & Time"
                                name="date"
                                type="datetime-local"
                                value={formData.date}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                                required
                            >
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Deactivate</MenuItem>
                                <MenuItem value="UPCOMING">Upcoming</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                                required
                                multiline
                                minRows={4}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Event Image (Optional)
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ height: 56, borderStyle: 'dashed' }}
                                >
                                    Choose Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleImageChange}
                                        disabled={loading}
                                    />
                                </Button>
                                {imagePreview && (
                                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Event preview"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '150px',
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0'
                                            }}
                                        />
                                        <IconButton
                                            onClick={handleRemoveImage}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                            }}
                                            size="small"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                                {selectedImage && (
                                    <Typography variant="body2" color="text.secondary">
                                        Selected: {selectedImage.name}
                                    </Typography>
                                )}
                            </Box>
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
                        {loading ? 'Creating…' : 'Create Event'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default CreateEventModal;
