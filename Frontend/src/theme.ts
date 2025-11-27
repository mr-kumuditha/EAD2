import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        accent: Palette['primary'];
    }
    interface PaletteOptions {
        accent?: PaletteOptions['primary'];
    }
}

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1F2A44' // Navy Blue
        },
        secondary: {
            main: '#836FFF' // Soft Purple
        },
        accent: {
            main: '#4DA3FF' // Sky Blue
        },
        success: {
            main: '#54D3A9' // Mint Green
        },
        error: {
            main: '#FF6B6B' // Soft Red
        },
        warning: {
            main: '#FFB84C' // Gold
        },
        background: {
            default: '#F5F6FA', // Light Gray
            paper: '#ffffff' // White for cards
        },
        text: {
            primary: '#333C4F', // Dark Gray
            secondary: '#A8B0C3' // Medium Gray
        }
    },
    shape: {
        borderRadius: 8 // Minimalist border radius
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif", // Crisp sans-serif
        h1: { fontWeight: 700, fontSize: '3.5rem', lineHeight: 1.1 },
        h2: { fontWeight: 600, fontSize: '2.5rem' },
        h3: { fontWeight: 600, fontSize: '2rem' },
        h4: { fontWeight: 500, fontSize: '1.5rem' },
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '12px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(31, 42, 68, 0.2)'
                    }
                },
                contained: {
                    backgroundColor: '#4DA3FF', // Sky Blue
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#3a8ce5'
                    }
                },
                outlined: {
                    borderColor: '#1F2A44', // Navy Blue
                    color: '#1F2A44',
                    '&:hover': {
                        backgroundColor: '#1F2A44',
                        color: '#ffffff'
                    }
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1F2A44', // Navy Blue
                    color: '#F5F6FA', // Light Gray
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
            }
        },
        MuiDialogTitle: {
            defaultProps: {
                component: 'div'
            }
        }
    }
});

export default theme;
