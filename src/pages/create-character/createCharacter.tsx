// src/pages/create-character/createCharacter.tsx
import {
  Box,
  Typography,
  Button,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useState } from "react";
import { fetchRaces, fetchClasses, fetchBackgrounds, fetchAlignments } from "../../api";
import { useFetch } from "../../api/useFetch";
import { SelectRace } from "./ui/select-race/selectRace";
import {
  ClassSelection,
  type ClassConfiguration,
} from "./ui/select-class/classSelection";
import { SelectBackground } from "./ui/select-background";
import { SelectPersonality } from "./ui/select-personality";
import { SelectAlignment } from "./ui/select-alignment";
import { CharacterSheet } from "./ui/character-sheet";
import {
  SelectAbilities,
  createAbilityScores,
  isAbilityScoresValid,
  isSkillSelectionValid,
  type AbilityScores,
} from "./ui/select-abilities";
import type { Race, Class, Background, Alignment } from "../../api";

const steps = [
  "Выбор расы",
  "Выбор класса",
  "Выбор происхождения",
  "Черты характера",
  "Характеристики",
  "Мировоззрение",
  "Лист персонажа",
];

const CreateCharacter = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [currentHitPoints, setCurrentHitPoints] = useState<number | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<{
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  } | null>(null);
  const [abilityScores, setAbilityScores] = useState<AbilityScores | null>(
    null,
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [classConfiguration, setClassConfiguration] =
    useState<ClassConfiguration | null>(null);

  const {
    data: races,
    loading: racesLoading,
    error: racesError,
  } = useFetch(fetchRaces);
  const {
    data: classes,
    loading: classesLoading,
    error: classesError,
  } = useFetch(fetchClasses);
  const {
    data: backgrounds,
    loading: backgroundsLoading,
    error: backgroundsError,
  } = useFetch(fetchBackgrounds);
  const {
    data: alignments,
    loading: alignmentsLoading,
    error: alignmentsError,
  } = useFetch(fetchAlignments);

  const handleNext = () => {
    if (activeStep === 0 && !selectedRace) return;
    if (activeStep === 1 && (!selectedClass || !classConfiguration)) return;
    if (activeStep === 2 && !selectedBackground) return;
    if (activeStep === 3 && !selectedPersonality) return;
    if (
      activeStep === 4 &&
      (!isAbilityScoresValid(abilityScores) ||
        !isSkillSelectionValid(selectedSkills, selectedClass))
    ) {
      return;
    }
    if (activeStep === 5 && !selectedAlignment) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    if (activeStep === 0) return !!selectedRace;
    if (activeStep === 1) return !!selectedClass && !!classConfiguration;
    if (activeStep === 2) return !!selectedBackground;
    if (activeStep === 3) return !!selectedPersonality;
    if (activeStep === 4) {
      return (
        isAbilityScoresValid(abilityScores) &&
        isSkillSelectionValid(selectedSkills, selectedClass)
      );
    }
    if (activeStep === 5) return !!selectedAlignment;
    return true;
  };

  const handleSelectClass = (cls: Class, configuration: ClassConfiguration) => {
    if (selectedClass?._id !== cls._id) {
      setAbilityScores(createAbilityScores(cls.recommended_stats));
      setSelectedSkills([]);
      setCurrentHitPoints(null);
    }
    setSelectedClass(cls);
    setClassConfiguration(configuration);
  };

  const handleClassConfigurationStart = () => {
    setSelectedClass(null);
    setClassConfiguration(null);
    setSelectedSkills([]);
  };

  const handleSelectRace = (race: Race) => {
    if (selectedRace?._id !== race._id) {
      setSelectedSkills([]);
    }
    setSelectedRace(race);
  };

  if (racesLoading || classesLoading || backgroundsLoading || alignmentsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  if (racesError) {
    return <Typography>Ошибка загрузки рас: {racesError}</Typography>;
  }
  if (classesError) {
    return <Typography>Ошибка загрузки классов: {classesError}</Typography>;
  }
  if (backgroundsError) {
    return (
      <Typography>Ошибка загрузки происхождений: {backgroundsError}</Typography>
    );
  }
  if (alignmentsError) {
    return <Typography>Ошибка загрузки мировоззрений: {alignmentsError}</Typography>;
  }

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg)",
          zIndex: 100,
          p: 2,
          borderRadius: 1,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel sx={{ gap: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ p: 2 }}>
        {activeStep === 0 && (
          <SelectRace
            races={races || []}
            selectedRace={selectedRace}
            onSelectRace={handleSelectRace}
          />
        )}
        {activeStep === 1 && (
          <ClassSelection
            classes={classes || []}
            onSelect={handleSelectClass}
            onConfigurationStart={handleClassConfigurationStart}
            onBack={handleBack}
          />
        )}
        {activeStep === 2 && (
          <SelectBackground
            backgrounds={backgrounds || []}
            selectedBackground={selectedBackground}
            onSelectBackground={setSelectedBackground}
          />
        )}
        {activeStep === 3 && selectedBackground && (
          <SelectPersonality
            personality={selectedBackground.suggested_personality}
            onConfirm={setSelectedPersonality}
          />
        )}
        {activeStep === 4 && selectedClass && selectedRace && abilityScores && (
          <SelectAbilities
            selectedClass={selectedClass}
            selectedRace={selectedRace}
            scores={abilityScores}
            selectedSkills={selectedSkills}
            onChange={setAbilityScores}
            onSkillsChange={setSelectedSkills}
          />
        )}
        {activeStep === 5 && (
          <SelectAlignment
            alignments={alignments || []}
            selectedAlignment={selectedAlignment}
            onSelectAlignment={setSelectedAlignment}
          />
        )}
        {activeStep === 6 &&
          selectedClass &&
          selectedRace &&
          selectedBackground &&
          selectedAlignment &&
          selectedPersonality &&
          abilityScores &&
          classConfiguration && (
            <CharacterSheet
              race={selectedRace}
              characterClass={selectedClass}
              background={selectedBackground}
              alignment={selectedAlignment}
              personality={selectedPersonality}
              abilityScores={abilityScores}
              selectedSkills={selectedSkills}
              classConfiguration={classConfiguration}
              characterName={characterName}
              currentHitPoints={currentHitPoints}
              onCharacterNameChange={setCharacterName}
              onCurrentHitPointsChange={setCurrentHitPoints}
            />
          )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Назад
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={!isStepValid() || activeStep === steps.length - 1}
        >
          {activeStep === steps.length - 1 ? "Завершить" : "Далее"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateCharacter;
