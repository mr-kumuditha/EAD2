import React, { useEffect, useMemo, useState } from 'react';
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
import type { Event, UpdateEventRequest } from '../../types';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UpdateEventRequest, imageFile?: File) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    event: Event | null;
    categories: string[];
}

const EVENT_STATUS_OPTIONS: Event['status'][] = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'COMPLETED'];

type EditFormState = {
    name: string;
    description: string;
    category: string;
    location: string;
    date: string;
    status: Event['status'];
    image?: File;
};

const EMPTY_FORM_STATE: EditFormState = {
    name: '',
    description: '',
    category: '',
    location: '',
    date: '',
    status: 'ACTIVE',
    image: undefined
};

const formatDateForInput = (dateIso: string): string => {
    if (!dateIso) {
        return '';
    }

    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
};

const EditEventModal: React.FC<EditEventModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    error = null,
    event,
    categories
}) => {
    const [formState, setFormState] = useState<EditFormState>(EMPTY_FORM_STATE);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categoryOptions = useMemo(() => {
        if (!event) {
            return categories;
        }

        if (categories.includes(event.category)) {
            return categories;
        }

        return [event.category, ...categories];
    }, [categories, event]);

    useEffect(() => {
        if (isOpen && event) {
            setFormState({
                name: event.name,
                description: event.description,
                category: event.category || categoryOptions[0] || '',
                location: event.location,
                date: formatDateForInput(event.date),
                status: event.status,
                image: undefined
            });
            setValidationError(null);
            setSelectedImage(null);
            setImagePreview(event.imageUrl || null);
        }

        if (!isOpen) {
            setFormState(EMPTY_FORM_STATE);
            setSelectedImage(null);
            setImagePreview(null);
        }
    }, [isOpen, event, categoryOptions]);

    if (!isOpen || !event) {
        return null;
    }

    const handleFieldChange = (updatedField: Partial<EditFormState>) => {
        setFormState((prev) => ({ ...prev, ...updatedField }));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setFormState((prev) => ({ ...prev, image: file }));

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
        setImagePreview(event?.imageUrl || null);
        setFormState((prev) => ({ ...prev, image: undefined }));
    };

    const handleSubmit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
        submitEvent.preventDefault();
        setValidationError(null);

        const trimmedState: EditFormState = {
            name: formState.name.trim(),
            description: formState.description.trim(),
            category: formState.category.trim(),
            location: formState.location.trim(),
            date: formState.date.trim(),
            status: formState.status
        };

        if (!trimmedState.name || !trimmedState.description || !trimmedState.category || !trimmedState.location) {
            setValidationError('Please complete all fields before saving.');
            return;
        }

        if (!trimmedState.date) {
            setValidationError('Please choose a valid date and time.');
            return;
        }

        const parsedDate = Date.parse(trimmedState.date);
        if (Number.isNaN(parsedDate)) {
            setValidationError('Please provide a valid date and time.');
            return;
        }

        const payload: UpdateEventRequest = {
            name: trimmedState.name,
            description: trimmedState.description,
            category: trimmedState.category,
            location: trimmedState.location,
            date: new Date(parsedDate).toISOString(),
            status: trimmedState.status
        };

        try {
            await onSubmit(payload, selectedImage || undefined);
        } catch (submitError) {
            console.error('Edit event submission failed:', submitError);
        }
    };

    return (
        <Dialog open={isOpen} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <DialogTitle sx={{ fontWeight: 600 }}>Edit Event</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Event Name"
                                name="name"
                                value={formState.name}
                                onChange={(changeEvent) => handleFieldChange({ name: changeEvent.target.value })}
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
                                value={formState.category}
                                onChange={(changeEvent) => handleFieldChange({ category: changeEvent.target.value })}
                                fullWidth
                                disabled={loading}
                                required
                            >
                                {categoryOptions.map((category) => (
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
                                value={formState.location}
                                onChange={(changeEvent) => handleFieldChange({ location: changeEvent.target.value })}
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
                                value={formState.date}
                                onChange={(changeEvent) => handleFieldChange({ date: changeEvent.target.value })}
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
                                value={formState.status}
                                onChange={(changeEvent) => handleFieldChange({ status: changeEvent.target.value as Event['status'] })}
                                fullWidth
                                disabled={loading}
                                required
                            >
                                {EVENT_STATUS_OPTIONS.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Description"
                                name="description"
                                value={formState.description}
                                onChange={(changeEvent) => handleFieldChange({ description: changeEvent.target.value })}
                                fullWidth
                                disabled={loading}
                                multiline
                                minRows={4}
                                required
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
                                    Choose New Image
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
                                {!selectedImage && event?.imageUrl && (
                                    <Typography variant="body2" color="text.secondary">
                                        Current image will be kept if no new image is selected
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
                        {loading ? 'Saving…' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EditEventModal;
