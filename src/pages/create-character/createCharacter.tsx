// src/pages/create-character/createCharacter.tsx
import {
  Box,
  Typography,
  Button,
  Step,
  StepButton,
  Stepper,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
import type { Race, Class, Background, Alignment, CharacterCurrency, CharacterEquipmentItem, Language } from "../../api";
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

const CHARACTER_DRAFT_STORAGE_KEY = 'dnd-character-wizard-draft-v1';

interface CharacterDraft {
  activeStep: number;
  selectedRace: Race | null;
  selectedClass: Class | null;
  selectedBackground: Background | null;
  selectedBackgroundLanguages: string[];
  selectedAlignment: Alignment | null;
  characterName: string;
  experience: number;
  featIds: string[];
  currentHitPoints: number | null;
  characterLevel: number;
  customEquipment: CharacterEquipmentItem[];
  removedEquipment: CharacterEquipmentItem[];
  currency: CharacterCurrency;
  selectedPersonality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  } | null;
  abilityScores: AbilityScores | null;
  selectedSkills: string[];
  classConfiguration: ClassConfiguration | null;
}

const readCharacterDraft = (): CharacterDraft | null => {
  try {
    const rawDraft = window.localStorage.getItem(CHARACTER_DRAFT_STORAGE_KEY);
    return rawDraft ? JSON.parse(rawDraft) as CharacterDraft : null;
  } catch {
    window.localStorage.removeItem(CHARACTER_DRAFT_STORAGE_KEY);
    return null;
  }
};

const CreateCharacter = () => {
  const [draft] = useState(readCharacterDraft);
  const [activeStep, setActiveStep] = useState(() => Math.max(0, Math.min(steps.length - 1, draft?.activeStep ?? 0)));
  const characterSheetRef = useRef<CharacterSheetHandle>(null);
  const [wizardResetVersion, setWizardResetVersion] = useState(0);

  const [selectedRace, setSelectedRace] = useState<Race | null>(() => draft?.selectedRace ?? null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(() => draft?.selectedClass ?? null);
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(() => draft?.selectedBackground ?? null);
  const [selectedBackgroundLanguages, setSelectedBackgroundLanguages] = useState<string[]>(() => draft?.selectedBackgroundLanguages ?? []);
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment | null>(() => draft?.selectedAlignment ?? null);
  const [characterName, setCharacterName] = useState(() => draft?.characterName ?? "");
  const [experience, setExperience] = useState(() => draft?.experience ?? 0);
  const [featIds, setFeatIds] = useState<string[]>(() => draft?.featIds ?? []);
  const [currentHitPoints, setCurrentHitPoints] = useState<number | null>(() => draft?.currentHitPoints ?? null);
  const [characterLevel, setCharacterLevel] = useState(() => draft?.characterLevel ?? 1);
  const [customEquipment, setCustomEquipment] = useState<CharacterEquipmentItem[]>(() => draft?.customEquipment ?? []);
  const [removedEquipment, setRemovedEquipment] = useState<CharacterEquipmentItem[]>(() => draft?.removedEquipment ?? []);
  const [currency, setCurrency] = useState<CharacterCurrency>(() => draft?.currency ?? ({
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 0,
    platinum: 0,
  }));
  const [selectedPersonality, setSelectedPersonality] = useState<{
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  } | null>(() => draft?.selectedPersonality ?? null);
  const [abilityScores, setAbilityScores] = useState<AbilityScores | null>(
    () => draft?.abilityScores ?? null,
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => draft?.selectedSkills ?? []);
  const [classConfiguration, setClassConfiguration] =
    useState<ClassConfiguration | null>(() => draft?.classConfiguration ?? null);
  const [classSectionValidity, setClassSectionValidity] = useState(() => ({
    equipment: Boolean(draft?.classConfiguration),
    magic: Boolean(draft?.classConfiguration),
  }));

  useEffect(() => {
    const draft: CharacterDraft = {
      activeStep,
      selectedRace,
      selectedClass,
      selectedBackground,
      selectedBackgroundLanguages,
      selectedAlignment,
      characterName,
      experience,
      featIds,
      currentHitPoints,
      characterLevel,
      customEquipment,
      removedEquipment,
      currency,
      selectedPersonality,
      abilityScores,
      selectedSkills,
      classConfiguration,
    };
    window.localStorage.setItem(CHARACTER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    abilityScores,
    activeStep,
    characterLevel,
    characterName,
    classConfiguration,
    currency,
    currentHitPoints,
    customEquipment,
    experience,
    featIds,
    removedEquipment,
    selectedAlignment,
    selectedBackground,
    selectedBackgroundLanguages,
    selectedClass,
    selectedPersonality,
    selectedRace,
    selectedSkills,
  ]);

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
    if (activeStep === 2 && !classSectionValidity.equipment) return;
    if (activeStep === 3 && (!classSectionValidity.magic || !classConfiguration)) return;
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

  const handleResetDraft = () => {
    window.localStorage.removeItem(CHARACTER_DRAFT_STORAGE_KEY);
    setActiveStep(0);
    setSelectedRace(null);
    setSelectedClass(null);
    setSelectedBackground(null);
    setSelectedBackgroundLanguages([]);
    setSelectedAlignment(null);
    setCharacterName('');
    setExperience(0);
    setFeatIds([]);
    setCurrentHitPoints(null);
    setCharacterLevel(1);
    setCustomEquipment([]);
    setRemovedEquipment([]);
    setCurrency({ copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 });
    setSelectedPersonality(null);
    setAbilityScores(null);
    setSelectedSkills([]);
    setClassConfiguration(null);
    setClassSectionValidity({ equipment: false, magic: false });
    setWizardResetVersion((version) => version + 1);
  };

  const isStepValid = () => {
    if (activeStep === 0) return !!selectedRace;
    if (activeStep === 1) return !!selectedClass;
    if (activeStep === 2) return classSectionValidity.equipment;
    if (activeStep === 3) return classSectionValidity.magic && !!classConfiguration;
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
    setClassSectionValidity({ equipment: false, magic: false });
  };

  const handleClassConfigurationStart = () => {
    setSelectedClass(null);
    setClassConfiguration(null);
    setClassSectionValidity({ equipment: false, magic: false });
    setSelectedSkills([]);
  };

  const handleClassSectionValidityChange = (
    section: 'class' | 'equipment' | 'magic',
    isValid: boolean,
  ) => {
    if (section === 'class') return;
    setClassSectionValidity((current) => (
      current[section] === isValid
        ? current
        : { ...current, [section]: isValid }
    ));
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
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepButton
                onClick={() => {
                  if (index < activeStep) setActiveStep(index);
                }}
                disabled={index >= activeStep}
                aria-label={`Вернуться к шагу: ${label}`}
              >
                {label}
              </StepButton>
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
            key={wizardResetVersion}
            classes={classes || []}
            initialSelectedClass={selectedClass}
            initialSelectedSubclass={classConfiguration?.subclass}
            onSelect={handleSelectClass}
            onClassSelected={handleClassSelected}
            onConfigurationChange={setClassConfiguration}
            onConfigurationStart={handleClassConfigurationStart}
            onSectionValidityChange={handleClassSectionValidityChange}
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
              currency={currency}
              onCustomEquipmentChange={setCustomEquipment}
              onRemovedEquipmentChange={setRemovedEquipment}
              onCurrencyChange={setCurrency}
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
        <Button variant="text" color="error" onClick={handleResetDraft}>
          Сбросить черновик
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
