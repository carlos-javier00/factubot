import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Dialog } from "@mui/material";
import SelectOriginFolderComponent from "./steps/SelectOriginFolderComponent";
import MoveNotCompleteComponent from "./steps/MoveNotCompleteComponent";
import AnalyzeComponent from "./steps/AnalyzeComponent";
import ClassifyComponent from "./steps/ClassifyComponent";
import { LinearProgress } from "@mui/material";

// Componentes de ejemplo para cada paso
const Step4Component = () => <div>Clasificar comprobantes</div>;

export default function WizardComponent() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [comprobantes, setComprobantes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const steps = [
    {
      name: "Seleccionar carpeta de origen",
      optional: false,
      skipped: false,
      component: (
        <SelectOriginFolderComponent
          setComprobantes={setComprobantes}
          comprobantes={comprobantes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      name: "Mover comprobantes no procesables",
      optional: false,
      skipped: false,
      component: (
        <MoveNotCompleteComponent
          setComprobantes={setComprobantes}
          comprobantes={comprobantes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      name: "Analizar comprobantes",
      optional: false,
      skipped: false,
      component: (
        <AnalyzeComponent
          setComprobantes={setComprobantes}
          comprobantes={comprobantes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
    {
      name: "Clasificar comprobantes",
      optional: false,
      skipped: false,
      component: (
        <ClassifyComponent
          setComprobantes={setComprobantes}
          comprobantes={comprobantes}
          loading={loading}
          setLoading={setLoading}
        />
      ),
    },
  ];

  const isStepOptional = (step) => {
    return steps[step].optional;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button onClick={() => setLoading(true)}>Probar dialogo de carga</Button>
      <Typography>{comprobantes.length}</Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={step.name} {...stepProps}>
              <StepLabel {...labelProps}>{step.name}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Box sx={{ mt: 2 }}>{steps[activeStep].component}</Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
      <Dialog open={loading.loading}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Typography variant="h5">{loading.title}</Typography>
          {loading.infinite ? (
            <LinearProgress style={{ margin: "20px 0" }} />
          ) : (
            <LinearProgress
              variant="determinate"
              value={(loading.progress / loading.total) * 100}
              style={{ margin: "20px 0" }}
            />
          )}
          {!loading.infinite && (
            <Typography variant="body1">{`Progreso: ${loading.progress} de ${loading.total}`}</Typography>
          )}
          <Button onClick={() => setLoading(false)}>Cerrar</Button>
        </div>
      </Dialog>
    </Box>
  );
}
