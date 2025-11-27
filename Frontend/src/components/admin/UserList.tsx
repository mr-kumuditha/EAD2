import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Stack,
    Button,
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { User } from '../../types';

interface UserListProps {
    users: User[];
    loading?: boolean;
    onEditUser?: (user: User) => void;
    onDeleteUser?: (userId: number) => void;
}

const UserList: React.FC<UserListProps> = ({
    users,
    loading = false,
    onEditUser,
    onDeleteUser
}) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (users.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h2" color="text.disabled" sx={{ mb: 2 }}>
                    👥
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    No users found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria or check back later.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {users.map((user) => (
                <Card
                    key={user.userId}
                    sx={{
                        borderRadius: 3,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: (theme) => theme.shadows[8]
                        }
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    bgcolor: user.role === 'ADMIN' ? 'primary.main' : 'secondary.main'
                                }}
                            >
                                {(user.firstName?.[0] || user.username[0]).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    @{user.username}
                                </Typography>
                            </Box>
                            <Chip
                                label={user.role}
                                color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                size="small"
                                variant="outlined"
                            />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {user.email}
                        </Typography>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => onEditUser?.(user)}
                                variant="outlined"
                                color="primary"
                            >
                                Edit
                            </Button>
                            <IconButton
                                size="small"
                                onClick={() => onDeleteUser?.(user.userId)}
                                color="error"
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'error.light',
                                        color: 'error.contrastText'
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default UserList;
