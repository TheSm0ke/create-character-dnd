import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
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
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
  fetchArmors,
  fetchFeats,
  fetchSpellsByClassAndLevel,
  fetchSkills,
  fetchWeapons,
  createCharacter,
  updateCharacter,
  searchEquipment,
  type Alignment,
  type Armor,
  type Background,
  type Class,
  type CharacterEquipmentItem,
  type CharacterCurrency,
  type CreateCharacterPayload,
  type Race,
  type Spell,
  type Weapon,
} from '../../../../api';
import { useFetch } from '../../../../api/useFetch';
import type { AbilityKey } from '../../../../api/classes';
import type { AbilityScores } from '../select-abilities';
import type { ClassConfiguration } from '../select-class/classSelection';
import { getClassBackgroundImage } from '../../../../assets/class-icons';
import { SubclassSelection } from '../select-class/class-configuration/ui/SubclassSelection';
import { getSubclassUnlockLevel } from '../select-class/class-configuration/subclassUtils';
import { FeatureList, SpellSlots, SummaryCard } from './SheetPrimitives';

interface Personality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
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
  onCustomEquipmentChange?: (equipment: CharacterEquipmentItem[]) => void;
  onRemovedEquipmentChange?: (equipment: CharacterEquipmentItem[]) => void;
  onCurrencyChange?: (currency: CharacterCurrency) => void;
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

const getSpellCost = (spell: Spell) => (
  spell.level === 'Заговор' ? 'без ячейки' : `${spell.level}-я ячейка`
);

const SpellList = ({ title, spells }: { title: string; spells: Spell[] }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
      {title}
    </Typography>
    {spells.length > 0 ? (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
        {spells.map((spell) => (
          <Tooltip
            key={spell._id}
            arrow
            enterTouchDelay={0}
            placement="right-start"
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: 300,
                  height: 240,
                  p: 1,
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  backgroundColor: 'grey.900',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid',
                  borderColor: 'primary.main',
                },
              },
              arrow: { sx: { color: 'grey.900' } },
            }}
            title={
              <Box sx={{ p: 0.5, maxWidth: 280 }}>
                <Typography variant="subtitle2" sx={{ color: 'common.white', fontWeight: 'bold', mb: 0.5 }}>
                  {spell.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.300', display: 'block', whiteSpace: 'pre-line' }}>
                  {spell.description || 'Описание отсутствует.'}
                </Typography>
                {spell.higher_levels && (
                  <Typography variant="caption" sx={{ color: 'grey.300', display: 'block', mt: 1, whiteSpace: 'pre-line' }}>
                    На больших уровнях: {spell.higher_levels}
                  </Typography>
                )}
              </Box>
            }
          >
            <Paper
              component="article"
              variant="outlined"
              tabIndex={0}
              aria-label={`${spell.name}. Стоимость: ${getSpellCost(spell)}.`}
              sx={{
                minWidth: 0,
                p: 1,
                cursor: 'help',
                transition: 'background-color 150ms ease, border-color 150ms ease',
                '&:hover, &:focus-visible': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography variant="subtitle2" noWrap title={spell.name}>
                {spell.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5, mb: 0 }}>
                Стоимость: {getSpellCost(spell)}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
                Урон: {spell.damage_dice || '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
                Тип урона: {spell.damage_type || '—'}
              </Typography>
            </Paper>
          </Tooltip>
        ))}
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Не выбрано.
      </Typography>
    )}
  </Box>
);

const calculateArmorClass = (armors: Armor[], dexterityModifier: number) => {
  const shield = armors.find((armor) => normalize(armor.name).includes('щит'));
  const wornArmor = armors.find((armor) => !normalize(armor.name).includes('щит'));
  const shieldBonus = Number(shield?.classArmor.match(/\d+/)?.[0] ?? 0);

  if (!wornArmor) return 10 + dexterityModifier + shieldBonus;

  const baseArmorClass = Number(wornArmor.classArmor.match(/\d+/)?.[0] ?? 10);
  const armorText = normalize(wornArmor.classArmor);
  const dexterityCap = Number(armorText.match(/максимум\s*(\d+)/)?.[1] ?? dexterityModifier);
  const dexterityBonus = armorText.includes('лов')
    ? Math.min(dexterityModifier, dexterityCap)
    : 0;

  return baseArmorClass + dexterityBonus + shieldBonus;
};

const getWeightInPounds = (weight?: string) => {
  if (!weight) return undefined;

  const normalizedWeight = weight.replace(',', '.');
  const fraction = normalizedWeight.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);

  const value = normalizedWeight.match(/\d+(?:\.\d+)?/)?.[0];
  return value ? Number(value) : undefined;
};

interface InventoryEntry {
  name: string;
  count: number;
  editableCount: number;
  type: string;
  weight?: string;
  details: string;
  sourcePack?: string;
  sourceName: string;
}

interface SearchInventoryItem {
  _id: string;
  name: string;
  count?: number;
  weight?: string;
  detail?: string;
  description?: string;
  category?: string;
  type?: string;
  damage?: string | null;
  damageType?: string | null;
  classArmor?: string;
  needStrong?: number;
  Secrecy?: boolean;
  properties?: { name: string }[];
  skills?: unknown[];
}

interface AppliedLevelChange {
  level: number;
  abilityScoreIncrease?: AbilityKey;
  featAbilityBonuses?: Array<{ ability: AbilityKey; bonus: number }>;
  selectedSubclassId?: string;
  addedCantripIds: string[];
  addedSpellIds: string[];
  addedFeatId?: string;
}

const getInventoryTypeLabel = (type?: string) => {
  if (type?.toLocaleLowerCase('ru-RU') === 'item') return 'Предмет';
  return type || 'Снаряжение';
};

const getInventoryEntryFromSearchItem = (
  item: SearchInventoryItem,
  count: number,
  editableCount: number,
  sourceName: string,
  sourcePack?: string,
): InventoryEntry => {
  if (item.damage !== undefined) {
    return {
      name: item.name,
      count,
      editableCount,
      sourceName,
      type: 'Оружие',
      weight: item.weight,
      details: `Урон: ${item.damage ?? '—'} ${item.damageType ?? ''}. ${item.properties?.map((property) => property.name).join(', ') || 'Без особых свойств.'}`,
      sourcePack,
    };
  }

  if (item.classArmor) {
    return {
      name: item.name,
      count,
      editableCount,
      sourceName,
      type: 'Броня',
      weight: item.weight,
      details: `КД: ${item.classArmor}. Требование Силы: ${item.needStrong || 'нет'}. Помеха скрытности: ${item.Secrecy ? 'да' : 'нет'}.`,
      sourcePack,
    };
  }

  return {
    name: item.name,
    count,
    editableCount,
    sourceName,
    type: getInventoryTypeLabel(item.category || item.type),
    weight: item.weight,
    details: item.detail || item.description || 'Описание отсутствует в справочнике.',
    sourcePack,
  };
};

const mergeInventoryEntries = (entries: InventoryEntry[]): InventoryEntry[] => {
  const entriesByName = new Map<string, InventoryEntry>();

  entries.forEach((entry) => {
    const key = normalize(entry.name);
    const current = entriesByName.get(key);
    if (!current) {
      entriesByName.set(key, { ...entry, sourceName: entry.name });
      return;
    }

    const sourcePacks = [current.sourcePack, entry.sourcePack]
      .flatMap((sourcePack) => sourcePack?.split(', ') ?? []);
    const sourcePack = [...new Set(sourcePacks)].join(', ') || undefined;
    const entryWithDetails = !current.weight && entry.weight ? entry : current;

    entriesByName.set(key, {
      ...entryWithDetails,
      name: current.name,
      sourceName: current.name,
      count: current.count + entry.count,
      editableCount: current.editableCount + entry.editableCount,
      sourcePack,
    });
  });

  return [...entriesByName.values()];
};

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
  onCustomEquipmentChange,
  onRemovedEquipmentChange,
  onCurrencyChange,
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
  const [availableCantrips, setAvailableCantrips] = useState<Spell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
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
  const proficiencyBonus = characterClass.levels.find(({ level }) => level === characterLevel)?.proficiency_bonus
    ?? (Math.ceil(characterLevel / 4) + 1);
  const armorClass = calculateArmorClass(selectedArmors, dexterityModifier);
  const classSkills = [
    ...selectedSkills,
    ...(race.skill_proficiencies ?? []),
    ...background.skill_proficiencies,
  ].filter((skill, index, values) => values.indexOf(skill) === index);
  const proficientSkills = new Set(classSkills.map(normalize));
  const userSelectedSkills = new Set(selectedSkills.map(normalize));
  const allSkills = [...skills].sort((first, second) => {
    const firstSelected = proficientSkills.has(normalize(first.name));
    const secondSelected = proficientSkills.has(normalize(second.name));

    if (firstSelected !== secondSelected) return firstSelected ? -1 : 1;
    return first.name.localeCompare(second.name, 'ru-RU');
  });
  const currentLevelSlots = characterClass.spellcasting?.spell_slots_progression?.find(
    ({ level }) => level === characterLevel,
  )?.slots;
  const classBackgroundImage = getClassBackgroundImage(characterClass.name);
  const unlockedSubclassSpells = selectedSubclass?.class_spells?.filter(
    ({ level_requirement }) => level_requirement <= characterLevel,
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
  const cantripsToChooseAtNextLevel = Math.max(
    0,
    (nextLevelInfo?.cantrips_known ?? classConfiguration.cantrips.length) - classConfiguration.cantrips.length,
  );
  const spellsToChooseAtNextLevel = Math.max(
    0,
    (nextLevelInfo?.spells_known ?? classConfiguration.spells1.length) - classConfiguration.spells1.length,
  );
  const maxSpellLevelAtNextLevel = (nextLevelInfo?.slots ?? []).reduce(
    (maximumLevel, slots, index) => (slots > 0 ? index + 1 : maximumLevel),
    0,
  );
  const requiresCantripSelection = cantripsToChooseAtNextLevel > 0;
  const requiresSpellSelection = spellsToChooseAtNextLevel > 0;
  const requiresAdvancementChoice = requiresAbilityScoreIncrease;

  useEffect(() => {
    if (pendingLevel === null || (!requiresCantripSelection && !requiresSpellSelection)) return undefined;

    let cancelled = false;
    const className = characterClass.name.toLocaleLowerCase('ru-RU');

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
        const [cantrips, spellLevels] = await Promise.all([cantripPromise, spellsPromise]);

        if (cancelled) return;
        setAvailableCantrips(cantrips.filter((spell) => (
          !classConfiguration.cantrips.some((selectedSpell) => selectedSpell._id === spell._id)
        )));
        setAvailableSpells(spellLevels.flat().filter((spell) => (
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
    classConfiguration.cantrips,
    classConfiguration.spells1,
    maxSpellLevelAtNextLevel,
    pendingLevel,
    requiresCantripSelection,
    requiresSpellSelection,
  ]);

  const resetPendingLevelChoices = () => {
    setAbilityScoreIncrease('');
    setAdvancementChoice('ability');
    setPendingFeatId('');
    setPendingFeatAbilityChoices({});
    setPendingSubclassId('');
    setPendingCantrips([]);
    setPendingSpells([]);
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

    if (onClassConfigurationChange) {
      onClassConfigurationChange?.({
        ...classConfiguration,
        subclass: pendingSubclassId || classConfiguration.subclass,
        cantrips: [...classConfiguration.cantrips, ...pendingCantrips],
        spells1: [...classConfiguration.spells1, ...pendingSpells],
      });
    }

    setAppliedLevelChanges((changes) => [
      ...changes,
      {
        level: pendingLevel,
        abilityScoreIncrease: advancementChoice === 'ability' ? abilityScoreIncrease || undefined : undefined,
        selectedSubclassId: pendingSubclassId || undefined,
        addedCantripIds: pendingCantrips.map((spell) => spell._id),
        addedSpellIds: pendingSpells.map((spell) => spell._id),
        addedFeatId: advancementChoice === 'feat' ? pendingFeatId || undefined : undefined,
        featAbilityBonuses: appliedFeatAbilityBonuses,
      },
    ]);
    onCharacterLevelChange?.(pendingLevel);
    setPendingLevel(null);
    resetPendingLevelChoices();
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
        cantrip_ids: classConfiguration.cantrips.map((spell) => spell._id),
        spell_ids: classConfiguration.spells1.map((spell) => spell._id),
      },
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

  const basicTab = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <SummaryCard title="Раса">
        <Typography variant="h5">{race.name}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {race.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          <Chip label={`Размер: ${race.size}`} size="small" />
          <Chip label={`Скорость: ${race.speed} фт.`} size="small" />
          {race.ability_bonuses.map(({ ability, bonus }) => (
            <Chip key={ability} label={`+${bonus} ${ability}`} color="secondary" size="small" />
          ))}
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Языки
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {race.languages.map((language) => language.name).join(', ') || 'Нет данных'}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Черты расы
        </Typography>
        <FeatureList features={race.traits.map((trait) => ({ ...trait, level: 1 }))} />
      </SummaryCard>

      <SummaryCard title="Класс" backgroundImage={classBackgroundImage}>
        <Typography variant="h5">{characterClass.name}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {characterClass.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          <Chip label={`Хиты: ${characterClass.hit_dice}`} color="secondary" size="small" />
          <Chip label={`Основная характеристика: ${characterClass.primary_ability}`} size="small" />
          {selectedSubclass && <Chip label={`Подкласс: ${selectedSubclass.name}`} color="primary" size="small" />}
        </Box>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Владения
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Доспехи: {characterClass.proficiencies.armor.join(', ') || 'нет'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Оружие: {characterClass.proficiencies.weapons.join(', ') || 'нет'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Инструменты: {characterClass.proficiencies.tools.join(', ') || 'нет'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Спасброски: {characterClass.proficiencies.saving_throws.join(', ')}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Умения класса
        </Typography>
        <FeatureList features={characterClass.features} characterLevel={characterLevel} />
        {selectedSubclass && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Подкласс: {selectedSubclass.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
              {selectedSubclass.description}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
              Особенности подкласса
            </Typography>
            <FeatureList features={selectedSubclass.features} characterLevel={characterLevel} />
          </>
        )}
      </SummaryCard>

    </Box>
  );

  const combatTab = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <SummaryCard title="Оружие и броня">
        {selectedWeapons.length > 0 && (
          <>
            <Typography variant="subtitle2">Оружие</Typography>
            <List dense disablePadding>
              {selectedWeapons.map((weapon: Weapon) => (
                <ListItem key={weapon._id} disableGutters>
                  <ListItemText
                    primary={weapon.name}
                    secondary={`${weapon.damage ?? '—'} ${weapon.damageType ?? ''} · ${weapon.properties.map((property) => property.name).join(', ') || 'без свойств'}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        {selectedArmors.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Броня</Typography>
            <List dense disablePadding>
              {selectedArmors.map((armor: Armor) => (
                <ListItem key={armor._id} disableGutters>
                  <ListItemText
                    primary={armor.name}
                    secondary={`КД: ${armor.classArmor}; Сила: ${armor.needStrong || 'нет'}; Помеха скрытности: ${armor.Secrecy ? 'да' : 'нет'}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
        {selectedWeapons.length === 0 && selectedArmors.length === 0 && (
          <Typography variant="body2" color="text.secondary">Снаряжение не выбрано.</Typography>
        )}
      </SummaryCard>

      <SummaryCard title="Магия">
        {characterClass.spellcasting ? (
          <>
            <Typography variant="body2" color="text.secondary">
              Базовая характеристика: {characterClass.spellcasting.ability}. Фокус: {characterClass.spellcasting.focus || 'не указан'}.
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Ячейки на {characterLevel}-м уровне</Typography>
            <SpellSlots slots={currentLevelSlots} />
            <Divider sx={{ my: 2 }} />
            <SpellList title="Заговоры" spells={classConfiguration.cantrips} />
            <SpellList title="Заклинания" spells={classConfiguration.spells1} />
            {unlockedSubclassSpells.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Заклинания подкласса</Typography>
                {unlockedSubclassSpells.map(({ level_requirement, spells }) => (
                  <Box key={level_requirement} sx={{ mt: 1 }}>
                    <Chip label={`${level_requirement}-й уровень`} size="small" variant="outlined" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {spells.join(', ')}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">Этот класс не использует заклинания.</Typography>
        )}
      </SummaryCard>
    </Box>
  );

  const personalitySections: Array<{ title: string; values: string[] }> = [
    { title: 'Черты характера', values: personality.traits },
    { title: 'Идеалы', values: personality.ideals },
    { title: 'Привязанности', values: personality.bonds },
    { title: 'Слабости', values: personality.flaws },
  ];

  const socialTab = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <SummaryCard title="Навыки">
        {skillsLoading ? (
          <Typography variant="body2" color="text.secondary">Загрузка навыков…</Typography>
        ) : allSkills.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
            {allSkills.map((skill) => {
              const selected = proficientSkills.has(normalize(skill.name));
              const selectedByUser = userSelectedSkills.has(normalize(skill.name));
              const abilityKey = abilityKeyFromName(skill.ability);
              const abilityModifier = abilityKey
                ? Math.floor((totalScores[abilityKey] - 10) / 2)
                : 0;
              const modifier = abilityModifier + (selected ? proficiencyBonus : 0);

              return (
                <Paper
                  key={skill._id}
                  variant="outlined"
                  sx={{
                    p: 1,
                    borderColor: selected ? 'primary.main' : 'divider',
                    backgroundColor: selected ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Box>
                      <Typography variant="subtitle2">{skill.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {skill.ability}
                        {selectedByUser ? ' · выбрано пользователем' : selected ? ' · владение' : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="secondary.main">
                        {modifier >= 0 ? `+${modifier}` : modifier}
                      </Typography>
                      {selected && (
                        <Chip
                          label={selectedByUser ? 'Выбрано' : 'Владение'}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Справочник навыков недоступен.</Typography>
        )}
      </SummaryCard>
      <SummaryCard title="Характер и мировоззрение">
        <Chip label={`${alignment.name} (${alignment.abbreviation})`} color="primary" sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">{alignment.description}</Typography>
        {personalitySections.map(({ title, values }) => (
          <Box key={title} sx={{ mt: 2 }}>
            <Typography variant="subtitle2">{title}</Typography>
            <List dense disablePadding>
              {values.map((value) => <ListItem key={value} disableGutters><ListItemText primary={value} /></ListItem>)}
            </List>
          </Box>
        ))}
      </SummaryCard>
    </Box>
  );

  const inventoryTab = (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Общий вес
            </Typography>
            <Typography variant="h4">
              <Box component="span" sx={{ color: isOverCarryingCapacity ? 'error.main' : 'secondary.main' }}>
                {carriedWeight.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
              </Box>
              {' / '}{carryingCapacity.toLocaleString('ru-RU')} фнт.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Максимальная нагрузка рассчитывается как Сила × 15.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => setIsInventoryDialogOpen(true)}>
            Добавить предмет
          </Button>
        </Box>
        {hasItemsWithoutWeight && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            В итог не включены предметы без веса в справочнике.
          </Typography>
        )}
        {isOverCarryingCapacity && (
          <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
            Превышен максимальный переносимый вес.
          </Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Кошелёк</Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' },
            gap: 1.25,
          }}
        >
          {([
            ['platinum', 'Платина'],
            ['gold', 'Золото'],
            ['electrum', 'Электрум'],
            ['silver', 'Серебро'],
            ['copper', 'Медь'],
          ] as Array<[keyof CharacterCurrency, string]>).map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              type="number"
              value={currency[key] ?? 0}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value)) return;
                onCurrencyChange?.({ ...currency, [key]: Math.max(0, Math.floor(value)) });
              }}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              size="small"
              disabled={!onCurrencyChange}
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Всего: {currencyValueCp.toLocaleString('ru-RU')} мм · {(currencyValueCp / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} зм
          {coinCount > 0 && ` · Вес монет: ${currencyWeight.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} фнт.`}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Курс: 10 мм = 1 см, 5 см = 1 эм, 2 эм = 1 зм, 10 зм = 1 пм. 50 монет весят 1 фнт.
        </Typography>
      </Paper>

      {inventoryEntries.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {inventoryEntries.map((entry, index) => {
            const entryKey = `${normalize(entry.sourceName)}-${index}`;
            const removalCount = Math.min(
              entry.editableCount,
              Math.max(1, inventoryRemovalCounts[entryKey] ?? 1),
            );

            return (
            <Card key={entryKey} component="article" variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                  <Typography variant="h6" component="h2">{entry.name}</Typography>
                  {entry.count > 1 && <Chip label={`×${entry.count}`} color="primary" size="small" />}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                  <Chip label={entry.type} size="small" variant="outlined" />
                  <Chip label={entry.weight ? `${entry.weight} × ${entry.count}` : 'Вес неизвестен'} color="secondary" size="small" />
                  {entry.sourcePack && <Chip label={`Набор: ${entry.sourcePack}`} size="small" />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {entry.details}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {entry.editableCount > 1 && (
                    <TextField
                      label="Количество"
                      type="number"
                      value={removalCount}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value)) {
                          setInventoryRemovalCounts((counts) => ({
                            ...counts,
                            [entryKey]: Math.max(1, Math.min(entry.editableCount, value)),
                          }));
                        }
                      }}
                      slotProps={{ htmlInput: { min: 1, max: entry.editableCount, step: 1 } }}
                      size="small"
                      sx={{ width: 132 }}
                    />
                  )}
                  <Button size="small" color="error" onClick={() => removeInventoryItem(entry, removalCount)}>
                    Удалить
                  </Button>
                  {entry.editableCount > removalCount && (
                    <Button size="small" color="error" onClick={() => removeInventoryItem(entry, entry.editableCount)}>
                      Удалить всё
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
            );
          })}
        </Box>
      ) : (
        <SummaryCard title="Инвентарь">
          <Typography variant="body2" color="text.secondary">Снаряжение не выбрано.</Typography>
        </SummaryCard>
      )}

    </Box>
  );

  const tabPanels = [basicTab, combatTab, socialTab, inventoryTab];

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
        {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
        {savedCharacterId && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {characterId ? 'Изменения сохранены.' : 'Персонаж создан.'} Идентификатор: {savedCharacterId}
          </Alert>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab label="Основное" />
          <Tab label="Бой и магия" />
          <Tab label="Навыки и характер" />
          <Tab label="Инвентарь" />
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
          {(requiresCantripSelection || requiresSpellSelection) && (
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
                  <Typography variant="subtitle2">
                    Заговоры: {pendingCantrips.length}/{cantripsToChooseAtNextLevel}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mt: 1 }}>
                    {availableCantrips.map((spell) => {
                      const selected = pendingCantrips.some((item) => item._id === spell._id);
                      const disabled = !selected && pendingCantrips.length >= cantripsToChooseAtNextLevel;
                      return (
                        <Card
                          key={spell._id}
                          variant="outlined"
                          onClick={() => {
                            if (disabled) return;
                            setPendingCantrips((spells) => (
                              selected
                                ? spells.filter((item) => item._id !== spell._id)
                                : [...spells, spell]
                            ));
                          }}
                          sx={{
                            p: 1.5,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.55 : 1,
                            borderColor: selected ? 'primary.main' : undefined,
                          }}
                        >
                          <Typography variant="subtitle2">{spell.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {spell.school} · {spell.damage_dice ?? 'без урона'}
                          </Typography>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              )}
              {requiresSpellSelection && !levelSpellsLoading && !levelSpellsError && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Заклинания: {pendingSpells.length}/{spellsToChooseAtNextLevel}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mt: 1 }}>
                    {availableSpells.map((spell) => {
                      const selected = pendingSpells.some((item) => item._id === spell._id);
                      const disabled = !selected && pendingSpells.length >= spellsToChooseAtNextLevel;
                      return (
                        <Card
                          key={spell._id}
                          variant="outlined"
                          onClick={() => {
                            if (disabled) return;
                            setPendingSpells((spells) => (
                              selected
                                ? spells.filter((item) => item._id !== spell._id)
                                : [...spells, spell]
                            ));
                          }}
                          sx={{
                            p: 1.5,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.55 : 1,
                            borderColor: selected ? 'primary.main' : undefined,
                          }}
                        >
                          <Typography variant="subtitle2">{spell.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {spell.level}-й уровень · {spell.school} · {spell.damage_dice ?? 'без урона'}
                          </Typography>
                        </Card>
                      );
                    })}
                  </Box>
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
              || levelSpellsLoading
              || Boolean(levelSpellsError)
            }
          >
            Подтвердить уровень
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isInventoryDialogOpen}
        onClose={() => setIsInventoryDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Добавление предмета</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="Поиск по названию"
            value={inventorySearchQuery}
            onChange={(event) => setInventorySearchQuery(event.target.value)}
            fullWidth
          />
          {inventorySearchQuery.trim().length < 2 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Введите не менее двух символов, чтобы найти предметы во всём справочнике.
            </Typography>
          )}
          {inventorySearchLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Поиск предметов…
            </Typography>
          )}
          {inventorySearchError && <Alert severity="error" sx={{ mt: 2 }}>{inventorySearchError}</Alert>}
          {!inventorySearchLoading && inventorySearchQuery.trim().length >= 2 && !inventorySearchError && (
            inventorySearchResults.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                  mt: 2,
                }}
              >
                {inventorySearchResults.map((item) => {
                  const entry = getInventoryEntryFromSearchItem(item, 1, 1, item.name);
                  return (
                    <Card key={item._id} variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{entry.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', my: 1 }}>
                          <Chip label={entry.type} size="small" variant="outlined" />
                          {entry.weight && <Chip label={`${entry.weight} фнт.`} size="small" color="secondary" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                          {entry.details}
                        </Typography>
                        <Button size="small" variant="contained" sx={{ mt: 2 }} onClick={() => addCustomInventoryItem(item)}>
                          Добавить
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                По этому названию ничего не найдено.
              </Typography>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInventoryDialogOpen(false)}>Готово</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
