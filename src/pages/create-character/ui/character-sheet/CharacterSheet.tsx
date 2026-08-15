import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  fetchArmors,
  fetchFeats,
  fetchSpellsByClassAndLevel,
  searchSpells,
  fetchSkills,
  fetchWeapons,
  createCharacter,
  updateCharacter,
  searchEquipment,
  type Alignment,
  type Background,
  type Class,
  type CharacterEquipmentItem,
  type CharacterCurrency,
  type CreateCharacterPayload,
  type Race,
  type Spell,
  type SpellGrant,
  type CharacterJournalPage,
} from '../../../../api';
import { useFetch } from '../../../../api/useFetch';
import type { AbilityKey } from '../../../../api/classes';
import type { AbilityScores } from '../select-abilities';
import type { ClassConfiguration } from '../select-class/classSelection';
import { getClassBackgroundImage } from '../../../../assets/class-icons';
import { SubclassSelection } from '../select-class/class-configuration/ui/SubclassSelection';
import { SpellSelection } from '../select-class/class-configuration/ui/SpellSelection';
import { getSubclassUnlockLevel } from '../select-class/class-configuration/subclassUtils';
import { JournalTab } from './JournalTab';
import { BasicTab, CombatTab, InventoryTab, SocialTab } from './CharacterSheetTabs';
import { InventorySearchDialog } from './InventorySearchDialog';
import { SaveNotification } from './SaveNotification';
import {
  calculateArmorClass,
  getInventoryEntryFromSearchItem,
  getWeightInPounds,
  mergeInventoryEntries,
  type InventoryEntry,
  type SearchInventoryItem,
} from './inventoryUtils';

interface Personality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

interface SpecialSpellChoice {
  level: number;
  count: number;
  spell_level: number;
  spell_list_class?: string;
  any_class?: boolean;
  title: string;
}

interface CharacterSheetProps {
  race: Race;
  characterClass: Class;
  background: Background;
  alignment: Alignment;
  personality: Personality;
  abilityScores: AbilityScores;
  selectedSkills: string[];
  selectedBackgroundLanguages: string[];
  classConfiguration: ClassConfiguration;
  characterName: string;
  experience?: number;
  featIds?: string[];
  currentHitPoints: number | null;
  maximumHitPoints?: number;
  initialConstitutionScore?: number;
  initialCharacterLevel?: number;
  characterLevel?: number;
  characterId?: string;
  onCharacterNameChange: (name: string) => void;
  onExperienceChange?: (experience: number) => void;
  onFeatIdsChange?: (featIds: string[]) => void;
  onCurrentHitPointsChange: (hitPoints: number | null) => void;
  onCharacterLevelChange?: (level: number) => void;
  onAbilityScoresChange?: (scores: AbilityScores) => void;
  onClassConfigurationChange?: (configuration: ClassConfiguration) => void;
  customEquipment?: CharacterEquipmentItem[];
  removedEquipment?: CharacterEquipmentItem[];
  currency?: CharacterCurrency;
  journalPages?: CharacterJournalPage[];
  onCustomEquipmentChange?: (equipment: CharacterEquipmentItem[]) => void;
  onRemovedEquipmentChange?: (equipment: CharacterEquipmentItem[]) => void;
  onCurrencyChange?: (currency: CharacterCurrency) => void;
  onJournalPagesChange?: (pages: CharacterJournalPage[]) => void;
}

export interface CharacterSheetHandle {
  saveCharacter: () => Promise<void>;
}

const ABILITIES: Array<{ key: AbilityKey; name: string; abbreviation: string }> = [
  { key: 'str', name: 'Сила', abbreviation: 'СИЛ' },
  { key: 'dex', name: 'Ловкость', abbreviation: 'ЛОВ' },
  { key: 'con', name: 'Телосложение', abbreviation: 'ТЕЛ' },
  { key: 'int', name: 'Интеллект', abbreviation: 'ИНТ' },
  { key: 'wis', name: 'Мудрость', abbreviation: 'МДР' },
  { key: 'cha', name: 'Харизма', abbreviation: 'ХАР' },
];

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');

const filterLevelSpells = (spells: Spell[], query: string, damageType: string | null, damageDice: string | null) => {
  const normalizedQuery = normalize(query);
  return spells.filter((spell) => (
    (!normalizedQuery || normalize(spell.name).includes(normalizedQuery))
    && (!damageType || spell.damage_type === damageType)
    && (!damageDice || spell.damage_dice === damageDice)
  ));
};

const abilityKeyFromName = (value: string): AbilityKey | undefined => {
  const normalized = normalize(value).replace(/[._-]/g, ' ');
  const aliases: Record<string, AbilityKey> = {
    сила: 'str',
    сил: 'str',
    str: 'str',
    ловкость: 'dex',
    лов: 'dex',
    dex: 'dex',
    телосложение: 'con',
    тел: 'con',
    con: 'con',
    интеллект: 'int',
    инт: 'int',
    int: 'int',
    мудрость: 'wis',
    мдр: 'wis',
    wis: 'wis',
    харизма: 'cha',
    хар: 'cha',
    cha: 'cha',
  };

  return aliases[normalized];
};

const formatModifier = (score: number) => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
};

const getHitDie = (hitDice: string) => Number(hitDice.match(/d(\d+)/i)?.[1] ?? 0);

interface AppliedLevelChange {
  level: number;
  abilityScoreIncrease?: AbilityKey;
  featAbilityBonuses?: Array<{ ability: AbilityKey; bonus: number }>;
  selectedSubclassId?: string;
  addedCantripIds: string[];
  addedSpellIds: string[];
  addedFeatId?: string;
}

export const CharacterSheet = forwardRef<CharacterSheetHandle, CharacterSheetProps>(({
  race,
  characterClass,
  background,
  alignment,
  personality,
  abilityScores,
  selectedSkills,
  selectedBackgroundLanguages,
  classConfiguration,
  characterName,
  experience = 0,
  featIds = [],
  currentHitPoints,
  maximumHitPoints,
  initialConstitutionScore,
  initialCharacterLevel = 1,
  characterLevel = 1,
  characterId,
  onCharacterNameChange,
  onExperienceChange,
  onFeatIdsChange,
  onCurrentHitPointsChange,
  onCharacterLevelChange,
  onAbilityScoresChange,
  onClassConfigurationChange,
  customEquipment = [],
  removedEquipment = [],
  currency = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
  journalPages = [],
  onCustomEquipmentChange,
  onRemovedEquipmentChange,
  onCurrencyChange,
  onJournalPagesChange,
}, ref) => {
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCharacterId, setSavedCharacterId] = useState<string | null>(null);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const [abilityScoreIncrease, setAbilityScoreIncrease] = useState<AbilityKey | ''>('');
  const [advancementChoice, setAdvancementChoice] = useState<'ability' | 'feat'>('ability');
  const [pendingFeatId, setPendingFeatId] = useState('');
  const [pendingFeatAbilityChoices, setPendingFeatAbilityChoices] = useState<Record<number, AbilityKey>>({});
  const [pendingSubclassId, setPendingSubclassId] = useState('');
  const [pendingCantrips, setPendingCantrips] = useState<Spell[]>([]);
  const [pendingSpells, setPendingSpells] = useState<Spell[]>([]);
  const [pendingSpecialSpells, setPendingSpecialSpells] = useState<Spell[]>([]);
  const [remainingSpellSlots, setRemainingSpellSlots] = useState<number[] | undefined>();
  const [slotResetVersion, setSlotResetVersion] = useState(0);
  const [cantripSearchQuery, setCantripSearchQuery] = useState('');
  const [spellSearchQuery, setSpellSearchQuery] = useState('');
  const [cantripDamageFilter, setCantripDamageFilter] = useState<string | null>(null);
  const [spellDamageFilter, setSpellDamageFilter] = useState<string | null>(null);
  const [cantripDamageDiceFilter, setCantripDamageDiceFilter] = useState<string | null>(null);
  const [spellDamageDiceFilter, setSpellDamageDiceFilter] = useState<string | null>(null);
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [availableSpecialSpells, setAvailableSpecialSpells] = useState<Spell[]>([]);
  const [levelSpellsLoading, setLevelSpellsLoading] = useState(false);
  const [levelSpellsError, setLevelSpellsError] = useState<string | null>(null);
  const [appliedLevelChanges, setAppliedLevelChanges] = useState<AppliedLevelChange[]>([]);
  const [isAbilityEditing, setIsAbilityEditing] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventorySearchResults, setInventorySearchResults] = useState<SearchInventoryItem[]>([]);
  const [inventorySearchLoading, setInventorySearchLoading] = useState(false);
  const [inventorySearchError, setInventorySearchError] = useState<string | null>(null);
  const [inventoryRemovalCounts, setInventoryRemovalCounts] = useState<Record<string, number>>({});
  const { data: skillsData, loading: skillsLoading } = useFetch(fetchSkills);
  const { data: featsData, loading: featsLoading } = useFetch(fetchFeats);
  const { data: weaponsData } = useFetch(fetchWeapons);
  const { data: armorsData } = useFetch(fetchArmors);
  const skills = skillsData ?? [];
  const weapons = weaponsData ?? [];
  const armors = armorsData ?? [];
  const feats = featsData ?? [];
  const pendingFeat = feats.find((feat) => feat._id === pendingFeatId);
  const pendingFeatAbilityBonuses = pendingFeat?.ability_bonuses ?? [];
  const selectedFeatAbilityBonuses = pendingFeatAbilityBonuses.flatMap((abilityBonus, index) => {
    const ability = abilityBonus.abilities.length === 1
      ? abilityBonus.abilities[0]
      : pendingFeatAbilityChoices[index];

    return ability
      ? [{ ability: ability as AbilityKey, bonus: abilityBonus.bonus, maximum: abilityBonus.maximum }]
      : [];
  });
  const requiresFeatAbilityChoice = pendingFeatAbilityBonuses.some(
    (abilityBonus, index) =>
      abilityBonus.abilities.length > 1 && !pendingFeatAbilityChoices[index],
  );

  const totalScores = useMemo(() => {
    const totals = { ...abilityScores };
    race.ability_bonuses.forEach(({ ability, bonus }) => {
      const key = abilityKeyFromName(ability);
      if (key) totals[key] += bonus;
    });
    return totals;
  }, [abilityScores, race.ability_bonuses]);
  const hasUnavailableFeatAbilityBonus = selectedFeatAbilityBonuses.some(
    ({ ability, maximum }) => totalScores[ability] >= maximum,
  );

  const selectedSubclass = characterClass.subclasses.find(
    (subclass) => subclass.id === classConfiguration.subclass,
  );
  const pendingSubclass = characterClass.subclasses.find(
    (subclass) => subclass.id === pendingSubclassId,
  );
  const effectiveSpellcasting = (pendingSubclass ?? selectedSubclass)?.spellcasting ?? characterClass.spellcasting;
  const equipmentNames = [
    ...characterClass.fixed_equipment.map((item) => item.name),
    ...classConfiguration.equipment.flat(),
    ...customEquipment.map((item) => item.name),
  ];
  const selectedEquipment = new Set(equipmentNames.map(normalize));
  const selectedWeapons = weapons.filter((weapon) => selectedEquipment.has(normalize(weapon.name)));
  const selectedArmors = armors.filter((armor) => selectedEquipment.has(normalize(armor.name)));
  const inventorySources = useMemo(() => {
    const counts = new Map<string, { name: string; count: number; editableCount: number; sourceName: string }>();
    const addItem = (name: string, count = 1, editable = false) => {
      const key = normalize(name);
      const current = counts.get(key);
      counts.set(key, {
        name,
        count: (current?.count ?? 0) + count,
        editableCount: (current?.editableCount ?? 0) + (editable ? count : 0),
        sourceName: name,
      });
    };

    characterClass.fixed_equipment.forEach((item) => addItem(item.name, item.count));
    classConfiguration.equipment.flat().forEach((item) => addItem(item, 1, true));
    classConfiguration.instruments?.forEach((instrument) => addItem(instrument, 1, true));
    customEquipment.forEach((item) => addItem(item.name, item.count, true));

    return [...counts.values()];
  }, [characterClass.fixed_equipment, classConfiguration.equipment, classConfiguration.instruments, customEquipment]);
  const [resolvedInventoryEntries, setResolvedInventoryEntries] = useState<InventoryEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadInventoryDetails = async () => {
      const entriesBySource = await Promise.all(
        inventorySources.map(async (source) => {
          try {
            const result = await searchEquipment(source.name);
            const foundItems = result.items as unknown as SearchInventoryItem[];

            if (foundItems.length > 0) {
              return foundItems.map((item) =>
                getInventoryEntryFromSearchItem(
                  item,
                  source.count * (item.count ?? 1),
                  source.editableCount * (item.count ?? 1),
                  source.sourceName,
                  result.isPack ? source.name : undefined,
                ),
              );
            }
          } catch {
            // Карточка-заполнитель ниже позволяет показать предмет даже при ошибке поиска.
          }

          return [{
            name: source.name,
            count: source.count,
            editableCount: source.editableCount,
            sourceName: source.sourceName,
            type: 'Снаряжение',
            details: 'Подробное описание не найдено в справочнике.',
          } satisfies InventoryEntry];
        }),
      );

      if (!cancelled) setResolvedInventoryEntries(mergeInventoryEntries(entriesBySource.flat()));
    };

    void loadInventoryDetails();

    return () => {
      cancelled = true;
    };
  }, [inventorySources]);

  const rawInventoryEntries: InventoryEntry[] = resolvedInventoryEntries ?? mergeInventoryEntries(
    inventorySources.map((source): InventoryEntry => ({
      ...source,
      type: 'Снаряжение',
      details: 'Загрузка подробностей предмета…',
    })),
  );
  const remainingRemovedCounts = new Map(
    removedEquipment.map((item) => [normalize(item.name), item.count]),
  );
  const inventoryEntries = rawInventoryEntries.flatMap((entry): InventoryEntry[] => {
    const key = normalize(entry.name);
    const removedCount = remainingRemovedCounts.get(key) ?? 0;
    const removedFromEntry = Math.min(entry.count, removedCount);
    remainingRemovedCounts.set(key, removedCount - removedFromEntry);
    const count = entry.count - removedFromEntry;

    return count > 0 ? [{ ...entry, count, editableCount: count }] : [];
  });
  const totalWeight = inventoryEntries.reduce(
    (total, entry) => total + (getWeightInPounds(entry.weight) ?? 0) * entry.count,
    0,
  );
  const coinCount = currency.copper + currency.silver + currency.electrum + currency.gold + currency.platinum;
  const currencyWeight = coinCount / 50;
  const carriedWeight = totalWeight + currencyWeight;
  const currencyValueCp = (
    currency.copper
    + currency.silver * 10
    + currency.electrum * 50
    + currency.gold * 100
    + currency.platinum * 1000
  );
  const carryingCapacity = totalScores.str * 15;
  const isOverCarryingCapacity = carriedWeight > carryingCapacity;
  const hasItemsWithoutWeight = inventoryEntries.some(
    (entry) => getWeightInPounds(entry.weight) === undefined,
  );

  useEffect(() => {
    if (!isInventoryDialogOpen || inventorySearchQuery.trim().length < 2) {
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setInventorySearchLoading(true);
      setInventorySearchError(null);
      void searchEquipment(inventorySearchQuery.trim())
        .then((result) => {
          if (!cancelled) setInventorySearchResults(result.items as unknown as SearchInventoryItem[]);
        })
        .catch(() => {
          if (!cancelled) setInventorySearchError('Не удалось выполнить поиск предметов.');
        })
        .finally(() => {
          if (!cancelled) setInventorySearchLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [inventorySearchQuery, isInventoryDialogOpen]);

  const addCustomInventoryItem = (item: SearchInventoryItem) => {
    const existingItem = customEquipment.find((entry) => normalize(entry.name) === normalize(item.name));
    const nextEquipment = existingItem
      ? customEquipment.map((entry) => (
        normalize(entry.name) === normalize(item.name)
          ? { ...entry, count: entry.count + 1 }
          : entry
      ))
      : [...customEquipment, { name: item.name, count: 1 }];

    onCustomEquipmentChange?.(nextEquipment);
  };

  const removeInventoryItem = (entry: InventoryEntry, quantity: number) => {
    const existingItem = removedEquipment.find((item) => normalize(item.name) === normalize(entry.name));
    const nextRemovedEquipment = existingItem
      ? removedEquipment.map((item) => (
        normalize(item.name) === normalize(entry.name)
          ? { ...item, count: item.count + quantity }
          : item
      ))
      : [...removedEquipment, { name: entry.name, count: quantity }];

    onRemovedEquipmentChange?.(nextRemovedEquipment);
  };

  const constitutionModifier = Math.floor((totalScores.con - 10) / 2);
  const initialConstitutionModifier = Math.floor(((initialConstitutionScore ?? totalScores.con) - 10) / 2);
  const dexterityModifier = Math.floor((totalScores.dex - 10) / 2);
  const hitDie = getHitDie(characterClass.hit_dice);
  const hitPointsPerLevel = Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier);
  const calculatedHitPoints = Math.max(
    1,
    hitDie + constitutionModifier + (characterLevel - 1) * hitPointsPerLevel,
  );
  const hitPoints = maximumHitPoints === undefined
    ? calculatedHitPoints
    : Math.max(
      1,
      maximumHitPoints
        + (constitutionModifier - initialConstitutionModifier) * initialCharacterLevel
        + (characterLevel - initialCharacterLevel) * hitPointsPerLevel,
    );
  const currentLevelInfo = characterClass.levels.find(({ level }) => level === characterLevel);
  const proficiencyBonus = currentLevelInfo?.proficiency_bonus
    ?? (Math.ceil(characterLevel / 4) + 1);
  const kiPoints = currentLevelInfo?.ki_points ?? 0;
  const backgroundSkills = background.skill_proficiencies ?? [];
  const armorClass = calculateArmorClass(selectedArmors, dexterityModifier);
  const classSkills = [
    ...selectedSkills,
    ...(race.skill_proficiencies ?? []),
    ...backgroundSkills,
  ].filter((skill, index, values) => values.indexOf(skill) === index);
  const proficientSkills = new Set(classSkills.map(normalize));
  const userSelectedSkills = new Set(selectedSkills.map(normalize));
  const allSkills = [...skills].sort((first, second) => {
    const firstSelected = proficientSkills.has(normalize(first.name));
    const secondSelected = proficientSkills.has(normalize(second.name));

    if (firstSelected !== secondSelected) return firstSelected ? -1 : 1;
    return first.name.localeCompare(second.name, 'ru-RU');
  });
  const currentLevelSlots = effectiveSpellcasting?.spell_slots_progression?.find(
    ({ level }) => level === characterLevel,
  )?.slots;
  const maximumAvailableSpellLevel = (currentLevelSlots ?? []).reduce(
    (maximumLevel, slots, index) => (slots > 0 ? index + 1 : maximumLevel),
    0,
  );
  const classBackgroundImage = getClassBackgroundImage(characterClass.name);
  const unlockedSubclassSpells = selectedSubclass?.class_spells?.filter(
    ({ level_requirement }) => level_requirement <= characterLevel,
  ) ?? [];
  const nextLevelSpellGrants: SpellGrant[] = pendingLevel === null
    ? []
    : (pendingSubclass ?? selectedSubclass)?.spell_grants?.filter(
      (grant) => grant.level_requirement === pendingLevel && grant.mode === 'automatic',
    ) ?? [];
  const nextLevelInfo = pendingLevel === null
    ? undefined
    : characterClass.levels.find(({ level }) => level === pendingLevel);
  const nextClassFeatures = pendingLevel === null
    ? []
    : characterClass.features.filter((feature) => feature.level === pendingLevel);
  const nextFeatureImprovements = pendingLevel === null
    ? []
    : characterClass.features.flatMap((feature) => feature.improvements
      .filter((improvement) => improvement.level === pendingLevel)
      .map((improvement) => ({ name: feature.name, description: improvement.description })));
  const nextSubclassFeatures = pendingLevel === null || !selectedSubclass
    ? []
    : selectedSubclass.features.filter((feature) => feature.level === pendingLevel);
  const requiresSubclassSelection = pendingLevel !== null
    && !selectedSubclass
    && characterClass.subclasses.some((subclass) => getSubclassUnlockLevel(subclass) <= pendingLevel);
  const requiresAbilityScoreIncrease = nextLevelInfo?.features.some((feature) => (
    normalize(feature).includes('увеличение характеристик')
  )) ?? false;
  const nextCantripCount = nextLevelInfo?.cantrips_known
    ?? effectiveSpellcasting?.cantrips_known_progression?.[Math.max(0, (pendingLevel ?? characterLevel) - 1)];
  const nextSpellCount = nextLevelInfo?.spells_known
    ?? effectiveSpellcasting?.spells_known_progression?.[Math.max(0, (pendingLevel ?? characterLevel) - 1)];
  const currentCantripCount = currentLevelInfo?.cantrips_known
    ?? effectiveSpellcasting?.cantrips_known_progression?.[Math.max(0, characterLevel - 1)]
    ?? 0;
  const specialSpellChoicesKey = JSON.stringify(effectiveSpellcasting?.special_spell_choices ?? []);
  const nextSpecialSpellChoices = useMemo(
    () => (JSON.parse(specialSpellChoicesKey) as SpecialSpellChoice[]).filter((choice) => choice.level === pendingLevel),
    [pendingLevel, specialSpellChoicesKey],
  );
  const specialSpellsToChoose = nextSpecialSpellChoices.reduce((total, choice) => total + choice.count, 0);
  const currentSpellCount = currentLevelInfo?.spells_known
    ?? effectiveSpellcasting?.spells_known_progression?.[Math.max(0, characterLevel - 1)]
    ?? 0;
  const cantripsToChooseAtNextLevel = Math.max(
    0,
    (nextCantripCount ?? currentCantripCount) - currentCantripCount,
  );
  const spellsToChooseAtNextLevel = Math.max(
    0,
    (nextSpellCount ?? currentSpellCount) - currentSpellCount - specialSpellsToChoose,
  );
  const nextLevelSlots = nextLevelInfo?.slots
    ?? effectiveSpellcasting?.spell_slots_progression?.find(({ level }) => level === pendingLevel)?.slots
    ?? [];
  const maxSpellLevelAtNextLevel = nextLevelSlots.reduce(
    (maximumLevel, slots, index) => (slots > 0 ? index + 1 : maximumLevel),
    0,
  );
  const requiresCantripSelection = cantripsToChooseAtNextLevel > 0;
  const requiresSpellSelection = spellsToChooseAtNextLevel > 0;
  const requiresSpecialSpellSelection = specialSpellsToChoose > 0;
  const requiresAdvancementChoice = requiresAbilityScoreIncrease;
  const filteredAvailableCantrips = useMemo(
    () => filterLevelSpells(availableCantrips, cantripSearchQuery, cantripDamageFilter, cantripDamageDiceFilter),
    [availableCantrips, cantripDamageDiceFilter, cantripDamageFilter, cantripSearchQuery],
  );
  const filteredAvailableSpells = useMemo(
    () => filterLevelSpells(availableSpells, spellSearchQuery, spellDamageFilter, spellDamageDiceFilter),
    [availableSpells, spellDamageDiceFilter, spellDamageFilter, spellSearchQuery],
  );
  const filteredAvailableSpecialSpells = useMemo(
    () => filterLevelSpells(availableSpecialSpells, spellSearchQuery, spellDamageFilter, spellDamageDiceFilter),
    [availableSpecialSpells, spellDamageDiceFilter, spellDamageFilter, spellSearchQuery],
  );

  useEffect(() => {
    const grants = (selectedSubclass?.spell_grants ?? []).filter(
      (grant) => grant.mode === 'automatic' && grant.level_requirement <= characterLevel,
    );
    const spellNames = grants.flatMap((grant) => grant.spells);
    if (!onClassConfigurationChange || spellNames.length === 0) return undefined;

    let cancelled = false;
    const addGrantedSpells = async () => {
      const matches = await Promise.all(spellNames.map((name) => searchSpells({ name })));
      if (cancelled) return;
      const additions = matches.map((spells, index) => (
        spells.find((spell) => normalize(spell.name) === normalize(spellNames[index]))
      )).filter((spell): spell is Spell => Boolean(spell)).filter((spell) => (
        !classConfiguration.spells1.some((selectedSpell) => selectedSpell._id === spell._id)
      ));

      if (additions.length > 0) {
        onClassConfigurationChange({
          ...classConfiguration,
          spells1: [...classConfiguration.spells1, ...additions],
        });
      }
    };

    void addGrantedSpells();
    return () => { cancelled = true; };
  }, [characterLevel, classConfiguration, onClassConfigurationChange, selectedSubclass]);

  useEffect(() => {
    if (pendingLevel === null || (!requiresCantripSelection && !requiresSpellSelection && !requiresSpecialSpellSelection)) return undefined;

    let cancelled = false;
    const className = (effectiveSpellcasting?.advancement?.spell_list_class ?? characterClass.name).toLocaleLowerCase('ru-RU');

    const loadLevelSpells = async () => {
      setLevelSpellsLoading(true);
      setLevelSpellsError(null);

      try {
        const cantripPromise: Promise<Spell[]> = requiresCantripSelection
          ? fetchSpellsByClassAndLevel(className, 'Заговор')
          : Promise.resolve([]);
        const spellsPromise: Promise<Spell[][]> = requiresSpellSelection
          ? Promise.all(
            Array.from(
              { length: Math.max(1, maxSpellLevelAtNextLevel) },
              (_, index) => fetchSpellsByClassAndLevel(className, index + 1),
            ),
          )
          : Promise.resolve([]);
        const specialSpellsPromise = requiresSpecialSpellSelection
          ? Promise.all(nextSpecialSpellChoices.flatMap((choice) => (
            choice.any_class
              ? [searchSpells({ level: String(choice.spell_level), category: '^spells$' })]
              : [fetchSpellsByClassAndLevel(choice.spell_list_class ?? className, choice.spell_level)]
          )))
          : Promise.resolve([]);
        const [cantrips, spellLevels, specialSpellLevels] = await Promise.all([cantripPromise, spellsPromise, specialSpellsPromise]);

        if (cancelled) return;
        setAvailableCantrips(cantrips.filter((spell) => (
          !classConfiguration.cantrips.some((selectedSpell) => selectedSpell._id === spell._id)
        )));
        setAvailableSpells(spellLevels.flat().filter((spell) => (
          !classConfiguration.spells1.some((selectedSpell) => selectedSpell._id === spell._id)
        )));
        setAvailableSpecialSpells(specialSpellLevels.flat().filter((spell) => (
          !classConfiguration.spells1.some((selectedSpell) => selectedSpell._id === spell._id)
        )));
      } catch {
        if (!cancelled) setLevelSpellsError('Не удалось загрузить список заклинаний класса.');
      } finally {
        if (!cancelled) setLevelSpellsLoading(false);
      }
    };

    void loadLevelSpells();
    return () => {
      cancelled = true;
    };
  }, [
    characterClass.name,
    effectiveSpellcasting,
    classConfiguration.cantrips,
    classConfiguration.spells1,
    maxSpellLevelAtNextLevel,
    pendingLevel,
    requiresCantripSelection,
    requiresSpellSelection,
    requiresSpecialSpellSelection,
    nextSpecialSpellChoices,
  ]);

  const resetPendingLevelChoices = () => {
    setAbilityScoreIncrease('');
    setAdvancementChoice('ability');
    setPendingFeatId('');
    setPendingFeatAbilityChoices({});
    setPendingSubclassId('');
    setPendingCantrips([]);
    setPendingSpells([]);
    setPendingSpecialSpells([]);
    setCantripSearchQuery('');
    setSpellSearchQuery('');
    setCantripDamageFilter(null);
    setSpellDamageFilter(null);
    setCantripDamageDiceFilter(null);
    setSpellDamageDiceFilter(null);
    setLevelSpellsError(null);
  };

  const handleIncreaseLevel = () => {
    if (characterLevel >= 20 || pendingLevel !== null) return;
    resetPendingLevelChoices();
    setPendingLevel(characterLevel + 1);
  };

  const handleDecreaseLevel = () => {
    if (characterLevel <= 1 || pendingLevel !== null) return;

    const change = appliedLevelChanges.find((item) => item.level === characterLevel);
    if ((change?.abilityScoreIncrease || change?.featAbilityBonuses?.length) && onAbilityScoresChange) {
      const nextScores = { ...abilityScores };

      if (change.abilityScoreIncrease) {
        nextScores[change.abilityScoreIncrease] = Math.max(1, nextScores[change.abilityScoreIncrease] - 2);
      }
      change.featAbilityBonuses?.forEach(({ ability, bonus }) => {
        nextScores[ability] = Math.max(1, nextScores[ability] - bonus);
      });

      onAbilityScoresChange(nextScores);
    }

    if (change && onClassConfigurationChange) {
      onClassConfigurationChange({
        ...classConfiguration,
        subclass: change.selectedSubclassId && classConfiguration.subclass === change.selectedSubclassId
          ? undefined
          : classConfiguration.subclass,
        cantrips: classConfiguration.cantrips.filter((spell) => !change.addedCantripIds.includes(spell._id)),
        spells1: classConfiguration.spells1.filter((spell) => !change.addedSpellIds.includes(spell._id)),
      });
    }
    if (change?.addedFeatId) {
      onFeatIdsChange?.(featIds.filter((featId) => featId !== change.addedFeatId));
    }

    if (change) {
      setAppliedLevelChanges((changes) => changes.filter((item) => item.level !== characterLevel));
    }
    onCharacterLevelChange?.(characterLevel - 1);
  };

  const handleConfirmLevelUp = () => {
    if (pendingLevel === null) return;
    if (requiresAdvancementChoice && advancementChoice === 'ability' && !abilityScoreIncrease) return;
    if (requiresAdvancementChoice && advancementChoice === 'feat' && !pendingFeatId) return;
    if (requiresAdvancementChoice && advancementChoice === 'feat' && requiresFeatAbilityChoice) return;
    if (requiresSubclassSelection && !pendingSubclassId) return;
    if (requiresCantripSelection && pendingCantrips.length !== cantripsToChooseAtNextLevel) return;
    if (requiresSpellSelection && pendingSpells.length !== spellsToChooseAtNextLevel) return;
    if (requiresSpecialSpellSelection && pendingSpecialSpells.length !== specialSpellsToChoose) return;

    if (advancementChoice === 'ability' && abilityScoreIncrease && onAbilityScoresChange) {
      onAbilityScoresChange({
        ...abilityScores,
        [abilityScoreIncrease]: Math.min(20, abilityScores[abilityScoreIncrease] + 2),
      });
    }
    const appliedFeatAbilityBonuses: Array<{ ability: AbilityKey; bonus: number }> = [];
    if (advancementChoice === 'feat' && pendingFeatId) {
      onFeatIdsChange?.([...featIds, pendingFeatId]);

      if (selectedFeatAbilityBonuses.length > 0 && onAbilityScoresChange) {
        const nextScores = { ...abilityScores };

        selectedFeatAbilityBonuses.forEach(({ ability, bonus, maximum }) => {
          const racialBonus = totalScores[ability] - abilityScores[ability];
          const availableIncrease = Math.max(0, maximum - (nextScores[ability] + racialBonus));
          const appliedBonus = Math.min(bonus, availableIncrease);

          if (appliedBonus > 0) {
            nextScores[ability] += appliedBonus;
            appliedFeatAbilityBonuses.push({ ability, bonus: appliedBonus });
          }
        });

        onAbilityScoresChange(nextScores);
      }
    }

    const applyLevelUp = async () => {
      const grantedSpellNames = nextLevelSpellGrants.flatMap((grant) => grant.spells);
      const grantedSpells = grantedSpellNames.length > 0
        ? (await Promise.all(grantedSpellNames.map((name) => searchSpells({ name })))).map((matches, index) => (
          matches.find((spell) => normalize(spell.name) === normalize(grantedSpellNames[index]))
        )).filter((spell): spell is Spell => Boolean(spell))
        : [];

      if (onClassConfigurationChange) {
      onClassConfigurationChange?.({
        ...classConfiguration,
        subclass: pendingSubclassId || classConfiguration.subclass,
        cantrips: [...classConfiguration.cantrips, ...pendingCantrips],
        spells1: [...classConfiguration.spells1, ...pendingSpells, ...pendingSpecialSpells, ...grantedSpells.filter((spell) => (
          !classConfiguration.spells1.some((selectedSpell) => selectedSpell._id === spell._id)
          && !pendingSpells.some((selectedSpell) => selectedSpell._id === spell._id)
        ))],
      });
      }

      setAppliedLevelChanges((changes) => [
      ...changes,
      {
        level: pendingLevel,
        abilityScoreIncrease: advancementChoice === 'ability' ? abilityScoreIncrease || undefined : undefined,
        selectedSubclassId: pendingSubclassId || undefined,
        addedCantripIds: pendingCantrips.map((spell) => spell._id),
        addedSpellIds: [...pendingSpells, ...pendingSpecialSpells].map((spell) => spell._id),
        addedFeatId: advancementChoice === 'feat' ? pendingFeatId || undefined : undefined,
        featAbilityBonuses: appliedFeatAbilityBonuses,
      },
      ]);
      onCharacterLevelChange?.(pendingLevel);
      setPendingLevel(null);
      resetPendingLevelChoices();
    };

    void applyLevelUp();
  };

  const handleSaveCharacter = async () => {
    if (saving || !characterName.trim()) return;

    const payload: CreateCharacterPayload = {
      name: characterName.trim(),
      level: characterLevel,
      experience,
      feat_ids: featIds,
      hit_points: {
        current: Math.min(currentHitPoints ?? hitPoints, hitPoints),
        maximum: hitPoints,
      },
      race_id: race._id,
      class_id: characterClass._id,
      subclass_id: classConfiguration.subclass,
      background_id: background._id,
      alignment_id: alignment._id,
      ability_scores: {
        base: abilityScores,
        total: totalScores,
      },
      skills: {
        selected: selectedSkills,
        granted_by_race: race.skill_proficiencies ?? [],
        granted_by_background: background.skill_proficiencies,
      },
      background_language_choices: selectedBackgroundLanguages,
      personality,
      inventory: {
        fixed_equipment: characterClass.fixed_equipment,
        selected_equipment: classConfiguration.equipment,
        instruments: classConfiguration.instruments ?? [],
        custom_equipment: customEquipment,
        removed_equipment: removedEquipment,
        currency,
      },
      spells: {
        cantrip_ids: classConfiguration.cantrips.filter((spell) => !spell._id.startsWith('custom-')).map((spell) => spell._id),
        spell_ids: classConfiguration.spells1.filter((spell) => !spell._id.startsWith('custom-')).map((spell) => spell._id),
        custom_spells: [...classConfiguration.cantrips, ...classConfiguration.spells1].filter((spell) => spell._id.startsWith('custom-')),
      },
      journal_pages: journalPages,
    };

    setSaving(true);
    setSaveError(null);
    setSavedCharacterId(null);

    try {
      const savedCharacter = characterId
        ? await updateCharacter(characterId, payload)
        : await createCharacter(payload);
      setSavedCharacterId(savedCharacter._id);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить персонажа.');
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({ saveCharacter: handleSaveCharacter }));

  const basicTab = <BasicTab race={race} characterClass={characterClass} characterLevel={characterLevel} selectedSubclass={selectedSubclass} classBackgroundImage={classBackgroundImage} />;
  const combatTab = <CombatTab selectedWeapons={selectedWeapons} selectedArmors={selectedArmors} characterLevel={characterLevel} effectiveSpellcasting={effectiveSpellcasting} classConfiguration={classConfiguration} kiPoints={kiPoints} slotResetVersion={slotResetVersion} currentLevelSlots={currentLevelSlots} remainingSpellSlots={remainingSpellSlots} maximumAvailableSpellLevel={maximumAvailableSpellLevel} unlockedSubclassSpells={unlockedSubclassSpells} onRestoreSlots={() => setSlotResetVersion((version) => version + 1)} onSpellSlotAvailabilityChange={setRemainingSpellSlots} onAddCustomSpell={(spell, cantrip) => onClassConfigurationChange?.({ ...classConfiguration, [cantrip ? 'cantrips' : 'spells1']: [...classConfiguration[cantrip ? 'cantrips' : 'spells1'], spell] })} />;
  const socialTab = <SocialTab background={background} backgroundSkills={backgroundSkills} skillsLoading={skillsLoading} allSkills={allSkills} proficientSkills={proficientSkills} userSelectedSkills={userSelectedSkills} totalScores={totalScores} proficiencyBonus={proficiencyBonus} alignment={alignment} personality={personality} abilityKeyFromName={abilityKeyFromName} />;
  const inventoryTab = <InventoryTab carriedWeight={carriedWeight} carryingCapacity={carryingCapacity} isOverCarryingCapacity={isOverCarryingCapacity} hasItemsWithoutWeight={hasItemsWithoutWeight} currency={currency} currencyValueCp={currencyValueCp} coinCount={coinCount} currencyWeight={currencyWeight} inventoryEntries={inventoryEntries} removalCounts={inventoryRemovalCounts} onOpenAddItem={() => setIsInventoryDialogOpen(true)} onCurrencyChange={onCurrencyChange} onRemovalCountChange={(key, count) => setInventoryRemovalCounts((counts) => ({ ...counts, [key]: count }))} onRemoveItem={removeInventoryItem} />;

  const journalTab = (
    <JournalTab
      characterId={characterId}
      pages={journalPages}
      saving={saving}
      onPagesChange={onJournalPagesChange}
      onSave={() => void handleSaveCharacter()}
    />
  );

  const tabPanels = [basicTab, combatTab, socialTab, inventoryTab, journalTab];

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Лист персонажа</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Персонаж {characterLevel}-го уровня · {race.name} · {characterClass.name}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) repeat(3, minmax(140px, 1fr))' },
            gap: 2,
          }}
        >
          <TextField
            label="Имя персонажа"
            value={characterName}
            onChange={(event) => onCharacterNameChange(event.target.value)}
            fullWidth
          />
          <TextField
            label="Хиты"
            type="number"
            value={currentHitPoints ?? hitPoints}
            onChange={(event) => {
              const value = event.target.value;
              onCurrentHitPointsChange(
                value === '' ? null : Math.min(hitPoints, Math.max(0, Number(value))),
              );
            }}
            slotProps={{
              htmlInput: { min: 0, max: hitPoints, step: 1 },
              input: {
                endAdornment: <InputAdornment position="end">/ {hitPoints}</InputAdornment>,
              },
            }}
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.75 }}>
            <Button
              aria-label="Понизить уровень"
              onClick={handleDecreaseLevel}
              disabled={characterLevel <= 1 || pendingLevel !== null}
              variant="outlined"
            >
              −
            </Button>
            <TextField
              label="Уровень"
              value={characterLevel}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
            <Button
              aria-label="Повысить уровень"
              onClick={handleIncreaseLevel}
              disabled={characterLevel >= 20 || pendingLevel !== null}
              variant="contained"
            >
              +
            </Button>
          </Box>
          <TextField
            label="Опыт"
            type="number"
            value={experience}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value)) onExperienceChange?.(Math.max(0, value));
            }}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            fullWidth
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="subtitle2">Характеристики</Typography>
          <FormControlLabel
            label="Ручной ввод"
            control={(
              <Switch
                checked={isAbilityEditing}
                disabled={!onAbilityScoresChange}
                onChange={(event) => setIsAbilityEditing(event.target.checked)}
              />
            )}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
          {ABILITIES.map(({ key, name, abbreviation }) => (
            <Paper key={key} variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {abbreviation}
              </Typography>
              {isAbilityEditing ? (
                <TextField
                  aria-label={name}
                  type="number"
                  value={totalScores[key]}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (!Number.isFinite(value)) return;
                    const racialBonus = totalScores[key] - abilityScores[key];
                    onAbilityScoresChange?.({
                      ...abilityScores,
                      [key]: Math.max(1, Math.min(30 - racialBonus, value - racialBonus)),
                    });
                  }}
                  slotProps={{ htmlInput: { min: 1, max: 30, step: 1 } }}
                  size="small"
                  sx={{ mt: 0.5, maxWidth: 88 }}
                />
              ) : (
                <Typography variant="h5">{totalScores[key]}</Typography>
              )}
              <Typography color="secondary.main">{formatModifier(totalScores[key])}</Typography>
              <Typography variant="caption" color="text.secondary">
                {name}
              </Typography>
            </Paper>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1, mt: 2 }}>
          <Typography>КД: <strong>{armorClass}</strong></Typography>
          <Typography>Инициатива: <strong>{formatModifier(totalScores.dex)}</strong></Typography>
          <Typography>Бонус мастерства: <strong>+{proficiencyBonus}</strong></Typography>
        </Box>
        {!characterName.trim() && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Укажите имя, чтобы создать персонажа.
          </Typography>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Основное" />
          <Tab label="Бой и магия" />
          <Tab label="Навыки и характер" />
          <Tab label="Инвентарь" />
          <Tab label="Дневник" />
        </Tabs>
      </Paper>
      <Box role="tabpanel">{tabPanels[tab]}</Box>
      <Dialog
        open={pendingLevel !== null}
        onClose={() => {
          setPendingLevel(null);
          resetPendingLevelChoices();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Повышение до {pendingLevel}-го уровня</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            Проверьте особенности, которые открываются на новом уровне, и подтвердите повышение.
          </Typography>
          {nextLevelInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Класс: {characterClass.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Бонус мастерства: +{nextLevelInfo.proficiency_bonus}
                {nextLevelInfo.cantrips_known !== undefined && ` · Заговоров: ${nextLevelInfo.cantrips_known}`}
                {nextLevelInfo.spells_known !== undefined && ` · Заклинаний: ${nextLevelInfo.spells_known}`}
              </Typography>
              {nextLevelInfo.features.length > 0 && (
                <List dense disablePadding sx={{ mt: 1 }}>
                  {nextLevelInfo.features.map((feature) => (
                    <ListItem key={feature} disableGutters>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
          {nextClassFeatures.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Новые особенности класса</Typography>
              <List dense disablePadding>
                {nextClassFeatures.map((feature) => (
                  <ListItem key={feature.id} disableGutters alignItems="flex-start">
                    <ListItemText primary={feature.name} secondary={feature.description} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {nextFeatureImprovements.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Улучшения особенностей</Typography>
              <List dense disablePadding>
                {nextFeatureImprovements.map((feature) => (
                  <ListItem key={`${feature.name}-${feature.description}`} disableGutters alignItems="flex-start">
                    <ListItemText primary={feature.name} secondary={feature.description} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {nextSubclassFeatures.length > 0 && selectedSubclass && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Подкласс: {selectedSubclass.name}</Typography>
              <List dense disablePadding>
                {nextSubclassFeatures.map((feature) => (
                  <ListItem key={feature.name} disableGutters alignItems="flex-start">
                    <ListItemText primary={feature.name} secondary={feature.description} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {nextLevelSpellGrants.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Заклинания подкласса</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Эти заклинания добавятся автоматически и не занимают лимит известных заклинаний.
              </Typography>
              <List dense disablePadding sx={{ mt: 0.75 }}>
                {nextLevelSpellGrants.flatMap((grant) => grant.spells).map((spell) => (
                  <ListItem key={spell} disableGutters><ListItemText primary={spell} /></ListItem>
                ))}
              </List>
            </Box>
          )}
          {requiresSubclassSelection && pendingLevel !== null && (
            <Box sx={{ mt: 2 }}>
              <SubclassSelection
                subclasses={characterClass.subclasses}
                selectedSubclass={pendingSubclassId}
                currentLevel={pendingLevel}
                onChange={setPendingSubclassId}
              />
            </Box>
          )}
          {(requiresCantripSelection || requiresSpellSelection || requiresSpecialSpellSelection) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Выбор новых заклинаний</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                На этом уровне необходимо выбрать новые заклинания класса.
              </Typography>
              {levelSpellsLoading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Загрузка доступных заклинаний…
                </Typography>
              )}
              {levelSpellsError && <Alert severity="error" sx={{ mt: 1.5 }}>{levelSpellsError}</Alert>}
              {requiresCantripSelection && !levelSpellsLoading && !levelSpellsError && (
                <Box sx={{ mt: 2 }}>
                  <SpellSelection
                    title="Заговоры"
                    spells={filteredAvailableCantrips}
                    selectedSpells={pendingCantrips}
                    toChoose={cantripsToChooseAtNextLevel}
                    loading={false}
                    className={effectiveSpellcasting?.advancement?.spell_list_class ?? characterClass.name}
                    isCantrip
                    searchQuery={cantripSearchQuery}
                    setSearchQuery={setCantripSearchQuery}
                    damageFilter={cantripDamageFilter}
                    setDamageFilter={setCantripDamageFilter}
                    damageTypes={[...new Set(availableCantrips.map((spell) => spell.damage_type).filter((type): type is string => Boolean(type)))]}
                    damageDiceFilter={cantripDamageDiceFilter}
                    setDamageDiceFilter={setCantripDamageDiceFilter}
                    damageDice={[...new Set(availableCantrips.map((spell) => spell.damage_dice).filter((dice): dice is string => Boolean(dice)))]}
                    onToggle={(spell) => setPendingCantrips((spells) => (
                      spells.some((item) => item._id === spell._id)
                        ? spells.filter((item) => item._id !== spell._id)
                        : spells.length < cantripsToChooseAtNextLevel ? [...spells, spell] : spells
                    ))}
                  />
                </Box>
              )}
              {requiresSpellSelection && !levelSpellsLoading && !levelSpellsError && (
                <Box sx={{ mt: 2 }}>
                  <SpellSelection
                    title="Заклинания"
                    spells={filteredAvailableSpells}
                    selectedSpells={pendingSpells}
                    toChoose={spellsToChooseAtNextLevel}
                    loading={false}
                    className={effectiveSpellcasting?.advancement?.spell_list_class ?? characterClass.name}
                    isCantrip={false}
                    searchQuery={spellSearchQuery}
                    setSearchQuery={setSpellSearchQuery}
                    damageFilter={spellDamageFilter}
                    setDamageFilter={setSpellDamageFilter}
                    damageTypes={[...new Set(availableSpells.map((spell) => spell.damage_type).filter((type): type is string => Boolean(type)))]}
                    damageDiceFilter={spellDamageDiceFilter}
                    setDamageDiceFilter={setSpellDamageDiceFilter}
                    damageDice={[...new Set(availableSpells.map((spell) => spell.damage_dice).filter((dice): dice is string => Boolean(dice)))]}
                    onToggle={(spell) => setPendingSpells((spells) => (
                      spells.some((item) => item._id === spell._id)
                        ? spells.filter((item) => item._id !== spell._id)
                        : spells.length < spellsToChooseAtNextLevel ? [...spells, spell] : spells
                    ))}
                  />
                </Box>
              )}
              {requiresSpecialSpellSelection && !levelSpellsLoading && !levelSpellsError && (
                <Box sx={{ mt: 2 }}>
                  <SpellSelection
                    title={nextSpecialSpellChoices.map((choice) => choice.title).join(', ')}
                    spells={filteredAvailableSpecialSpells}
                    selectedSpells={pendingSpecialSpells}
                    toChoose={specialSpellsToChoose}
                    loading={false}
                    className={characterClass.name}
                    isCantrip={false}
                    searchQuery={spellSearchQuery}
                    setSearchQuery={setSpellSearchQuery}
                    damageFilter={spellDamageFilter}
                    setDamageFilter={setSpellDamageFilter}
                    damageTypes={[...new Set(availableSpecialSpells.map((spell) => spell.damage_type).filter((type): type is string => Boolean(type)))]}
                    damageDiceFilter={spellDamageDiceFilter}
                    setDamageDiceFilter={setSpellDamageDiceFilter}
                    damageDice={[...new Set(availableSpecialSpells.map((spell) => spell.damage_dice).filter((dice): dice is string => Boolean(dice)))]}
                    onToggle={(spell) => setPendingSpecialSpells((spells) => (
                      spells.some((item) => item._id === spell._id)
                        ? spells.filter((item) => item._id !== spell._id)
                        : spells.length < specialSpellsToChoose ? [...spells, spell] : spells
                    ))}
                  />
                </Box>
              )}
            </Box>
          )}
          {requiresAdvancementChoice && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Увеличение характеристики или черта</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1.5 }}>
                <Button
                  variant={advancementChoice === 'ability' ? 'contained' : 'outlined'}
                  onClick={() => setAdvancementChoice('ability')}
                >
                  Характеристика +2
                </Button>
                <Button
                  variant={advancementChoice === 'feat' ? 'contained' : 'outlined'}
                  onClick={() => setAdvancementChoice('feat')}
                >
                  Выбрать черту
                </Button>
              </Box>
              {advancementChoice === 'ability' ? (
                <FormControl fullWidth required>
                  <InputLabel id="ability-score-increase-label">Улучшение характеристики</InputLabel>
                  <Select
                    labelId="ability-score-increase-label"
                    label="Улучшение характеристики"
                    value={abilityScoreIncrease}
                    onChange={(event) => setAbilityScoreIncrease(event.target.value as AbilityKey)}
                  >
                    {ABILITIES.map(({ key, name }) => (
                      <MenuItem key={key} value={key} disabled={abilityScores[key] >= 20}>
                        {name} +2 ({abilityScores[key]} → {Math.min(20, abilityScores[key] + 2)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Выберите одну черту. Уже выбранные персонажем черты недоступны.
                  </Typography>
                  {featsLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Загрузка черт…
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.5,
                        maxHeight: 440,
                        overflowY: 'auto',
                        pr: 1,
                      }}
                    >
                      {feats.map((feat) => {
                        const isSelected = pendingFeatId === feat._id;
                        const isAlreadyChosen = featIds.includes(feat._id);

                        return (
                          <Card
                            key={feat._id}
                            variant="outlined"
                            onClick={() => {
                              if (!isAlreadyChosen) {
                                setPendingFeatId(feat._id);
                                setPendingFeatAbilityChoices({});
                              }
                            }}
                            sx={{
                              cursor: isAlreadyChosen ? 'not-allowed' : 'pointer',
                              opacity: isAlreadyChosen ? 0.55 : 1,
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                              '&:hover': isAlreadyChosen
                                ? undefined
                                : { borderColor: 'primary.light', backgroundColor: 'action.hover' },
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                                <Typography variant="h6" component="h3">{feat.name}</Typography>
                              </Box>
                              {isSelected && (
                                <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.75 }}>
                                  Выбрано
                                </Typography>
                              )}
                              {isAlreadyChosen && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                                  Эта черта уже есть у персонажа
                                </Typography>
                              )}
                              {feat.prerequisite && (
                                <Typography variant="caption" color="secondary.main" sx={{ display: 'block', mt: 0.75 }}>
                                  Требование: {feat.prerequisite}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, whiteSpace: 'pre-line' }}
                              >
                                {feat.description}
                              </Typography>
                              {feat.benefits.length > 0 && (
                                <Typography variant="body2" sx={{ mt: 1.25 }}>
                                  Преимущества: {feat.benefits.join(', ')}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                  {pendingFeatAbilityBonuses.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Бонус характеристики
                      </Typography>
                      {pendingFeatAbilityBonuses.map((abilityBonus, index) => {
                        const isChoiceRequired = abilityBonus.abilities.length > 1;
                        const selectedAbility = isChoiceRequired
                          ? pendingFeatAbilityChoices[index]
                          : abilityBonus.abilities[0] as AbilityKey;

                        return (
                          <Box key={`${abilityBonus.abilities.join('-')}-${index}`} sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                              {isChoiceRequired
                                ? `Выберите характеристику: +${abilityBonus.bonus} (максимум ${abilityBonus.maximum})`
                                : `${ABILITIES.find(({ key }) => key === selectedAbility)?.name ?? selectedAbility}: +${abilityBonus.bonus} (максимум ${abilityBonus.maximum})`}
                            </Typography>
                            {isChoiceRequired ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {abilityBonus.abilities.map((ability) => {
                                  const key = ability as AbilityKey;
                                  const unavailable = totalScores[key] >= abilityBonus.maximum;

                                  return (
                                    <Button
                                      key={key}
                                      size="small"
                                      variant={pendingFeatAbilityChoices[index] === key ? 'contained' : 'outlined'}
                                      disabled={unavailable}
                                      onClick={() => setPendingFeatAbilityChoices((choices) => ({
                                        ...choices,
                                        [index]: key,
                                      }))}
                                    >
                                      {ABILITIES.find(({ key: abilityKey }) => abilityKey === key)?.name}
                                      {unavailable ? ' (максимум)' : ''}
                                    </Button>
                                  );
                                })}
                              </Box>
                            ) : totalScores[selectedAbility] >= abilityBonus.maximum ? (
                              <Typography variant="caption" color="error.main">
                                Бонус недоступен: значение характеристики уже достигло максимума.
                              </Typography>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPendingLevel(null);
              resetPendingLevelChoices();
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmLevelUp}
            disabled={
              (requiresAdvancementChoice && advancementChoice === 'ability' && !abilityScoreIncrease)
              || (requiresAdvancementChoice && advancementChoice === 'feat' && !pendingFeatId)
              || (requiresAdvancementChoice && advancementChoice === 'feat' && requiresFeatAbilityChoice)
              || (requiresAdvancementChoice && advancementChoice === 'feat' && hasUnavailableFeatAbilityBonus)
              || (requiresSubclassSelection && !pendingSubclassId)
              || (requiresCantripSelection && pendingCantrips.length !== cantripsToChooseAtNextLevel)
              || (requiresSpellSelection && pendingSpells.length !== spellsToChooseAtNextLevel)
              || (requiresSpecialSpellSelection && pendingSpecialSpells.length !== specialSpellsToChoose)
              || levelSpellsLoading
              || Boolean(levelSpellsError)
            }
          >
            Подтвердить уровень
          </Button>
        </DialogActions>
      </Dialog>
      <InventorySearchDialog
        open={isInventoryDialogOpen}
        query={inventorySearchQuery}
        loading={inventorySearchLoading}
        error={inventorySearchError}
        items={inventorySearchResults}
        onQueryChange={setInventorySearchQuery}
        onAddItem={addCustomInventoryItem}
        onClose={() => setIsInventoryDialogOpen(false)}
      />
      <SaveNotification
        characterId={characterId}
        savedCharacterId={savedCharacterId}
        error={saveError}
        onClose={() => {
          setSaveError(null);
          setSavedCharacterId(null);
        }}
      />
    </Box>
  );
});
