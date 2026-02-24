import { grey } from '@mui/material/colors';

export const getLightPalette = (primaryColor) => ({
  primary: {
    main: primaryColor,
  },

  background: {
    default: '#F9FAFC',
    paper: '#ffffff',
  },
  text: {
    primary: grey[900],
    secondary: grey[700],
  },
});

export const getDarkPalette = (primaryColor) => ({
  primary: {
    main: primaryColor,
  },
  background: {
    default: '#011a25',
    paper: '#001e2b',
  },
  text: {
    primary: grey[300],
    secondary: grey[400],
  },
});
