// src/pages/create-character/createCharacter.tsx
import {
  Box,
  Typography,
  Button,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useRef, useState } from "react";
import { fetchRaces, fetchClasses, fetchBackgrounds, fetchAlignments, fetchLanguages } from "../../api";
import { useFetch } from "../../api/useFetch";
import { SelectRace } from "./ui/select-race/selectRace";
import {
  ClassSelection,
  type ClassConfiguration,
} from "./ui/select-class/classSelection";
import { SelectBackground } from "./ui/select-background";
import { SelectPersonality } from "./ui/select-personality";
import { SelectAlignment } from "./ui/select-alignment";
import { CharacterSheet, type CharacterSheetHandle } from "./ui/character-sheet";
import {
  SelectAbilities,
  createAbilityScores,
  isAbilityScoresValid,
  isSkillSelectionValid,
  type AbilityScores,
} from "./ui/select-abilities";
import type { Race, Class, Background, Alignment, CharacterEquipmentItem, Language } from "../../api";
import { getBackgroundLanguageChoiceCount } from "./ui/select-background/languageChoices";
import { NavigationMenu } from "../../components/NavigationMenu";

const steps = [
  "Выбор расы",
  "Выбор класса",
  "Выбор снаряжения",
  "Выбор заклинаний",
  "Выбор происхождения",
  "Черты характера",
  "Характеристики",
  "Мировоззрение",
  "Лист персонажа",
];

const CreateCharacter = () => {
  const [activeStep, setActiveStep] = useState(0);
  const characterSheetRef = useRef<CharacterSheetHandle>(null);

  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [selectedBackgroundLanguages, setSelectedBackgroundLanguages] = useState<string[]>([]);
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment | null>(null);
  const [characterName, setCharacterName] = useState("");
  const [experience, setExperience] = useState(0);
  const [featIds, setFeatIds] = useState<string[]>([]);
  const [currentHitPoints, setCurrentHitPoints] = useState<number | null>(null);
  const [characterLevel, setCharacterLevel] = useState(1);
  const [customEquipment, setCustomEquipment] = useState<CharacterEquipmentItem[]>([]);
  const [removedEquipment, setRemovedEquipment] = useState<CharacterEquipmentItem[]>([]);
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
  const {
    data: languages,
    loading: languagesLoading,
    error: languagesError,
  } = useFetch(fetchLanguages);

  const handleNext = async () => {
    if (activeStep === 0 && !selectedRace) return;
    if (activeStep === 1 && !selectedClass) return;
    if (activeStep === 3 && !classConfiguration) return;
    if (
      activeStep === 4
      && (!selectedBackground
        || selectedBackgroundLanguages.length !== getBackgroundLanguageChoiceCount(selectedBackground.languages))
    ) return;
    if (activeStep === 5 && !selectedPersonality) return;
    if (
      activeStep === 6 &&
      (!isAbilityScoresValid(abilityScores) ||
        !isSkillSelectionValid(selectedSkills, selectedClass))
    ) {
      return;
    }
    if (activeStep === 7 && !selectedAlignment) return;
    if (activeStep === steps.length - 1) {
      await characterSheetRef.current?.saveCharacter();
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const isStepValid = () => {
    if (activeStep === 0) return !!selectedRace;
    if (activeStep === 1) return !!selectedClass;
    if (activeStep === 2) return true;
    if (activeStep === 3) return !!classConfiguration;
    if (activeStep === 4) {
      return !!selectedBackground
        && selectedBackgroundLanguages.length === getBackgroundLanguageChoiceCount(selectedBackground.languages);
    }
    if (activeStep === 5) return !!selectedPersonality;
    if (activeStep === 6) {
      return (
        isAbilityScoresValid(abilityScores) &&
        isSkillSelectionValid(selectedSkills, selectedClass)
      );
    }
    if (activeStep === 7) return !!selectedAlignment;
    if (activeStep === steps.length - 1) return !!characterName.trim();
    return true;
  };

  const handleSelectClass = (cls: Class, configuration: ClassConfiguration) => {
    setSelectedClass(cls);
    setClassConfiguration(configuration);
  };

  const handleClassSelected = (cls: Class) => {
    if (selectedClass?._id !== cls._id) {
      setAbilityScores(createAbilityScores(cls.recommended_stats));
      setSelectedSkills([]);
      setCurrentHitPoints(null);
    }
    setSelectedClass(cls);
    setClassConfiguration(null);
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

  const handleSelectBackground = (background: Background) => {
    if (selectedBackground?._id !== background._id) {
      setSelectedBackgroundLanguages([]);
    }
    setSelectedBackground(background);
  };

  if (racesLoading || classesLoading || backgroundsLoading || alignmentsLoading || languagesLoading) {
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
  if (languagesError) {
    return <Typography>Ошибка загрузки языков: {languagesError}</Typography>;
  }

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <NavigationMenu />
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
        <Box sx={{ display: activeStep >= 1 && activeStep <= 3 ? 'block' : 'none' }}>
          <ClassSelection
            classes={classes || []}
            onSelect={handleSelectClass}
            onClassSelected={handleClassSelected}
            onConfigurationChange={setClassConfiguration}
            onConfigurationStart={handleClassConfigurationStart}
            section={activeStep === 2 ? 'equipment' : activeStep === 3 ? 'magic' : 'class'}
          />
        </Box>
        {activeStep === 4 && (
          <SelectBackground
            backgrounds={backgrounds || []}
            languages={(languages ?? []) as Language[]}
            selectedBackground={selectedBackground}
            selectedBackgroundLanguages={selectedBackgroundLanguages}
            onSelectBackground={handleSelectBackground}
            onSelectedBackgroundLanguagesChange={setSelectedBackgroundLanguages}
          />
        )}
        {activeStep === 5 && selectedBackground && (
          <SelectPersonality
            personality={selectedBackground.suggested_personality}
            onConfirm={setSelectedPersonality}
          />
        )}
        {activeStep === 6 && selectedClass && selectedRace && selectedBackground && abilityScores && (
          <SelectAbilities
            selectedClass={selectedClass}
            selectedRace={selectedRace}
            selectedBackground={selectedBackground}
            scores={abilityScores}
            selectedSkills={selectedSkills}
            onChange={setAbilityScores}
            onSkillsChange={setSelectedSkills}
          />
        )}
        {activeStep === 7 && (
          <SelectAlignment
            alignments={alignments || []}
            selectedAlignment={selectedAlignment}
            onSelectAlignment={setSelectedAlignment}
          />
        )}
        {activeStep === 8 &&
          selectedClass &&
          selectedRace &&
          selectedBackground &&
          selectedAlignment &&
          selectedPersonality &&
          abilityScores &&
          classConfiguration && (
            <CharacterSheet
              ref={characterSheetRef}
              race={selectedRace}
              characterClass={selectedClass}
              background={selectedBackground}
              alignment={selectedAlignment}
              personality={selectedPersonality}
              abilityScores={abilityScores}
              selectedSkills={selectedSkills}
              classConfiguration={classConfiguration}
              selectedBackgroundLanguages={selectedBackgroundLanguages}
              characterName={characterName}
              experience={experience}
              featIds={featIds}
              currentHitPoints={currentHitPoints}
              characterLevel={characterLevel}
              onCharacterNameChange={setCharacterName}
              onExperienceChange={setExperience}
              onFeatIdsChange={setFeatIds}
              onCurrentHitPointsChange={setCurrentHitPoints}
              onCharacterLevelChange={setCharacterLevel}
              onAbilityScoresChange={setAbilityScores}
              onClassConfigurationChange={setClassConfiguration}
              customEquipment={customEquipment}
              removedEquipment={removedEquipment}
              onCustomEquipmentChange={setCustomEquipment}
              onRemovedEquipmentChange={setRemovedEquipment}
            />
          )}
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.default",
        }}
      >
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
          disabled={!isStepValid()}
        >
          {activeStep === steps.length - 1 ? "Сохранить" : "Далее"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateCharacter;
