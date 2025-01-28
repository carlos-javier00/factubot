import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import WelcomeName from "./WelcomeName";
import SignInSignOutButton from "./SignInSignOutButton";
import { Link as RouterLink } from "react-router-dom";
import { Box } from '@mui/material';

const NavBar = () => {
    return (
        <div style={{ flexGrow: 1 }}>
            <AppBar position="static" color="secondary">
                <Toolbar>
                    <Typography style={{ flexGrow: 1 }}>
                        <Link component={RouterLink} to="/" color="inherit" variant="h6" underline="none">{import.meta.env.VITE_TITLE}</Link>
                    </Typography>
                    <Box sx={{ 
                        visibility: { xs: 'hidden', sm: 'hidden', md: 'visible', lg: 'visible', xl: 'visible' },
                     }}>
                        <WelcomeName />
                    </Box>
                    <SignInSignOutButton />
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default NavBar;