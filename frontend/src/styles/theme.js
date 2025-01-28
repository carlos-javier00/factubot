import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@mui/material/styles';
import {  grey } from '@mui/material/colors';

// Create a theme instance.
export const theme = createMuiTheme({
  palette: {
    secondary: {
      main: grey[800],
    },
    primary: {
      main: "#C73142ff",
    },
  },
});
