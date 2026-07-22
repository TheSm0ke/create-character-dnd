import { SelectRace } from "./ui/select-race/selectRace";
import { SelectClass } from "./ui/select-class/selectedClass";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Box, Button, Fade, IconButton, Typography } from "@mui/material";
import { useState, useCallback, useRef, useEffect } from "react";
import style from './create-character.module.scss';
import { fetchClasses, fetchRaces } from "../../api";
import { useFetch } from "../../api/useFetch";
import theme from "../../theme";
import { ArrowDownIcon } from "./arrow-down-icon";
import type { Race, Class } from "../../api";
import { ClassConfiguration } from "./ui/select-class/class-configuration/ClassConfiguration";

const steps = [
  "Выбор расы",
  "Выбор класса",
  "Настройка класса",
  "Определите происхождение",
  "Определите значения характеристик",
  "Выбор мировоззрение",
];

const CreateCharacter = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());

  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classConfig, setClassConfig] = useState<{ skills: string[]; equipment: string[][] } | null>(null);

  const { data: races } = useFetch(fetchRaces);
  const { data: classes } = useFetch(fetchClasses);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  console.log(classConfig);

  const isStepOptional = useCallback((step: number) => {
    return step === 1;
  }, []);

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedRace) return;
    if (activeStep === 1 && !selectedClass) return;

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

  const handleClassConfirm = (config: { skills: string[]; equipment: string[][] }) => {
    setClassConfig(config);
    console.log('Конфигурация класса сохранена:', config);
    setActiveStep((prev) => prev + 1);
  };

  console.log('selectedClass', selectedClass);

  const previousActiveStepRef = useRef(activeStep);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousActiveStep = previousActiveStepRef.current;
    previousActiveStepRef.current = activeStep;

    if (activeStep === steps.length) {
      resetButtonRef.current?.focus();
      return;
    }
    if (activeStep === 0 && previousActiveStep === steps.length) {
      nextButtonRef.current?.focus();
      return;
    }
    if (isStepOptional(previousActiveStep) && !isStepOptional(activeStep)) {
      nextButtonRef.current?.focus();
    }
  }, [activeStep, isStepOptional]);

  console.log("activeStep", activeStep);

  return (
    <div className={style.main}>
      <Box style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg)', zIndex: 100, padding: 16, borderRadius: 8 }}>
        <Stepper activeStep={activeStep} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: { optional?: React.ReactNode } = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>

      {activeStep === 0 && (
        <SelectRace
          races={races ?? []}
          selectedRace={selectedRace}
          onSelectRace={setSelectedRace}
        />
      )}
      {activeStep === 1 && (
        <SelectClass
          classes={classes ?? []}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
        />
      )}
      {activeStep === 2 && selectedClass && (
        <ClassConfiguration
          classData={selectedClass}
          onConfirm={handleClassConfirm}
          onBack={handleBack}
        />
      )}
      {activeStep === 3 && <Box sx={{ p: 2 }}>Происхождение (скоро будет)</Box>}
      {activeStep === 4 && <Box sx={{ p: 2 }}>Характеристики (скоро будет)</Box>}
      {activeStep === 5 && <Box sx={{ p: 2 }}>Мировоззрение (скоро будет)</Box>}

      {activeStep !== 2 && (
        <Box style={{ position: 'sticky', bottom: 0, backgroundColor: 'var(--bg)', padding: 8 }}>
          <Typography sx={{ mt: 2, mb: 1 }}>Шаг {activeStep + 1}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Назад
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              ref={nextButtonRef}
              onClick={handleNext}
              disabled={activeStep === 0 && !selectedRace || activeStep === 1 && !selectedClass}
            >
              {activeStep === steps.length - 1 ? 'Создать' : 'Дальше'}
            </Button>
          </Box>
        </Box>
      )}

      <div ref={bottomRef} />

      <Fade in={true} timeout={400}>
        <IconButton
          onClick={scrollToBottom}
          sx={{
            position: 'fixed',
            bottom: 60,
            right: 45,
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            zIndex: 1000,
            boxShadow: theme.shadows[4],
          }}
        >
          <ArrowDownIcon />
        </IconButton>
      </Fade>
    </div>
  );
};

export default CreateCharacter;