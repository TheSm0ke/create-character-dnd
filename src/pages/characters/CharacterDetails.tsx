import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import {
  fetchCharacterById,
  fetchAlignments,
  fetchBackgrounds,
  fetchClasses,
  fetchRaces,
  fetchSpellById,
  type Alignment,
  type Background,
  type Character,
  type CharacterCurrency,
  type CharacterEquipmentItem,
  type CharacterJournalPage,
  type Class,
  type Race,
  type Spell,
} from '../../api';
import { useFetch } from '../../api/useFetch';
import { NavigationMenu } from '../../components/NavigationMenu';
import { CharacterSheet, type CharacterSheetHandle } from '../create-character/ui/character-sheet';
import type { AbilityScores } from '../create-character/ui/select-abilities';
import type { ClassConfiguration } from '../create-character/ui/select-class/classSelection';

interface CharacterSheetEditorProps {
  character: Character;
  race: Race;
  characterClass: Class;
  background: Background;
  alignment: Alignment;
  cantrips: Spell[];
  spells1: Spell[];
}

const CharacterSheetEditor = ({
  character,
  race,
  characterClass,
  background,
  alignment,
  cantrips,
  spells1,
}: CharacterSheetEditorProps) => {
  const characterSheetRef = useRef<CharacterSheetHandle>(null);
  const [characterName, setCharacterName] = useState(character.name);
  const [experience, setExperience] = useState(character.experience ?? 0);
  const [featIds, setFeatIds] = useState(character.feat_ids ?? []);
  const [currentHitPoints, setCurrentHitPoints] = useState<number | null>(character.hit_points.current);
  const [characterLevel, setCharacterLevel] = useState(character.level);
  const [abilityScores, setAbilityScores] = useState(character.ability_scores.base as AbilityScores);
  const [customEquipment, setCustomEquipment] = useState<CharacterEquipmentItem[]>(
    character.inventory.custom_equipment ?? [],
  );
  const [removedEquipment, setRemovedEquipment] = useState<CharacterEquipmentItem[]>(
    character.inventory.removed_equipment ?? [],
  );
  const [currency, setCurrency] = useState<CharacterCurrency>(
    character.inventory.currency ?? {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
    },
  );
  const [journalPages, setJournalPages] = useState<CharacterJournalPage[]>(character.journal_pages ?? []);

  const [classConfiguration, setClassConfiguration] = useState<ClassConfiguration>({
    skills: character.skills.selected,
    equipment: character.inventory.selected_equipment,
    subclass: character.subclass_id,
    instruments: character.inventory.instruments,
    cantrips,
    spells1,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => void characterSheetRef.current?.saveCharacter()}
          disabled={!characterName.trim()}
        >
          Сохранить изменения
        </Button>
      </Box>
      <CharacterSheet
        ref={characterSheetRef}
        characterId={character._id}
        race={race}
        characterClass={characterClass}
        background={background}
        alignment={alignment}
        personality={character.personality}
        abilityScores={abilityScores}
        selectedSkills={character.skills.selected}
        selectedBackgroundLanguages={character.background_language_choices}
        classConfiguration={classConfiguration}
        characterName={characterName}
        experience={experience}
        featIds={featIds}
        currentHitPoints={currentHitPoints}
        maximumHitPoints={character.hit_points.maximum}
        initialConstitutionScore={character.ability_scores.total.con}
        initialCharacterLevel={character.level}
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
        journalPages={journalPages}
        onCustomEquipmentChange={setCustomEquipment}
        onRemovedEquipmentChange={setRemovedEquipment}
        onCurrencyChange={setCurrency}
        onJournalPagesChange={setJournalPages}
      />
    </Box>
  );
};

const CharacterDetails = () => {
  const { characterId } = useParams();
  const { data: character, loading: characterLoading, error: characterError } = useFetch(
    () => fetchCharacterById(characterId ?? ''),
  );
  const { data: races, loading: racesLoading, error: racesError } = useFetch(fetchRaces);
  const { data: classes, loading: classesLoading, error: classesError } = useFetch(fetchClasses);
  const { data: backgrounds, loading: backgroundsLoading, error: backgroundsError } = useFetch(fetchBackgrounds);
  const { data: alignments, loading: alignmentsLoading, error: alignmentsError } = useFetch(fetchAlignments);
  const [cantrips, setCantrips] = useState<Spell[] | null>(null);
  const [spells1, setSpells1] = useState<Spell[] | null>(null);
  const [spellsError, setSpellsError] = useState<string | null>(null);
  const race = races?.find((item) => item._id === character?.race_id);
  const characterClass = classes?.find((item) => item._id === character?.class_id);
  const background = backgrounds?.find((item) => item._id === character?.background_id);
  const alignment = alignments?.find((item) => item._id === character?.alignment_id);

  useEffect(() => {
    if (!character) return undefined;

    let cancelled = false;

    const loadSpells = async () => {
      try {
        const [loadedCantrips, loadedSpells1] = await Promise.all([
          Promise.all(character.spells.cantrip_ids.map(fetchSpellById)),
          Promise.all(character.spells.spell_ids.map(fetchSpellById)),
        ]);

        if (!cancelled) {
          setCantrips(loadedCantrips);
          setSpells1(loadedSpells1);
          setSpellsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setSpellsError(error instanceof Error ? error.message : 'Не удалось загрузить заклинания.');
        }
      }
    };

    void loadSpells();

    return () => {
      cancelled = true;
    };
  }, [character]);

  const loading = characterLoading
    || racesLoading
    || classesLoading
    || backgroundsLoading
    || alignmentsLoading
    || (character !== null && (cantrips === null || spells1 === null) && spellsError === null);
  const error = characterError || racesError || classesError || backgroundsError || alignmentsError || spellsError;

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, sm: 3 }, pt: { xs: 8, sm: 3 } }}>
      <NavigationMenu />
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Загрузка персонажа" />
        </Box>
      )}
      {!loading && error && <Alert severity="error">Не удалось открыть персонажа: {error}</Alert>}
      {!loading && !error && character && race && characterClass && background && alignment && cantrips && spells1 && (
        <CharacterSheetEditor
          character={character}
          race={race}
          characterClass={characterClass}
          background={background}
          alignment={alignment}
          cantrips={cantrips}
          spells1={spells1}
        />
      )}
      {!loading && !error && (!character || !race || !characterClass || !background || !alignment || !cantrips || !spells1) && (
        <Alert severity="warning">Часть данных персонажа не найдена в справочниках.</Alert>
      )}
    </Box>
  );
};

export default CharacterDetails;
