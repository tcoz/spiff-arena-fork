import { ThemeOptions } from '@mui/material';

export const globalThemeLight: ThemeOptions = {
  palette: {
    mode: 'light',
    common: { black: '#000', white: '#fff' },
    primary: {
      light: '#7986cb',
      main: '#3F76B5',
      dark: '#543FB5',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
  },
  typography: {
    // Poppins is pulled in from the Google Fonts CDN in index.html
    // TODO: Install fonts locally?
    fontFamily: `"Poppins", "Roboto", "Arial", "Helvetica", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    button: {
      textTransform: 'none',
    },
  },
  components: {
    // We wanted rounded buttons everywhere
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          borderRadius: 100,
        },
      },
    },
  },
};

export const globalThemeDark: ThemeOptions = {
  palette: {
    mode: 'dark',
    common: { black: '#000', white: '#fff' },
    primary: {
      light: '#7986cb',
      main: '#3F76B5',
      dark: '#543FB5',
      contrastText: '#fff',
    },
  },
  typography: {
    // Poppins is pulled in from the Google Fonts CDN in index.html
    // TODO: Install fonts locally?
    fontFamily: `"Poppins", "Roboto", "Arial", "Helvetica", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    button: {
      textTransform: 'none',
    },
  },
  components: {
    // We wanted rounded buttons everywhere
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          borderRadius: 100,
        },
      },
    },
  },
};
