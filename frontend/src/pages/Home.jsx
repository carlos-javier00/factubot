import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import WizardComponent from "../components/classify/WizardComponent";
import { Container } from "@mui/material";

export function Home() {
  return (
    <>
      <AuthenticatedTemplate>
        <Container>
          <Typography variant="h6">
            <WizardComponent />
          </Typography>
        </Container>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Typography variant="h6">
          <center>¡Hola! Debes iniciar sesión para continuar...</center>
        </Typography>
      </UnauthenticatedTemplate>
    </>
  );
}