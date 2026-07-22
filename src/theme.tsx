import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#b71c1c' },
    secondary: { main: '#d4af37' },
    background: { default: '#0d0d0d', paper: '#1a1a1a' },
    text: { primary: '#f5f5f5', secondary: '#bdbdbd' },
    divider: 'rgba(255,255,255,0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.08em',
    },
    h2: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)',
            boxShadow: '0 4px 6px rgba(183, 28, 28, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;