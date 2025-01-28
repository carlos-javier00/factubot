import Typography from "@mui/material/Typography";
import NavBar from "./NavBar";
import { Container } from "@mui/material";

export const PageLayout = (props) => {
    return (
        <>
            <NavBar />
            <br />
            <br />
            <Container>
                {props.children}
            </Container>
        </>
    );
};