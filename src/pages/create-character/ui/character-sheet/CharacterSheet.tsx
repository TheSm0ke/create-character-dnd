import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchArmors,
  fetchSkills,
  fetchWeapons,
  searchEquipment,
  type Alignment,
  type Armor,
  type Background,
  type Class,
  type Race,
  type Spell,
  type Weapon,
} from '../../../../api';
import { useFetch } from '../../../../api/useFetch';
import type { AbilityKey } from '../../../../api/classes';
import type { AbilityScores } from '../select-abilities';
import type { ClassConfiguration } from '../select-class/classSelection';

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
  classConfiguration: ClassConfiguration;
  characterName: string;
  currentHitPoints: number | null;
  onCharacterNameChange: (name: string) => void;
  onCurrentHitPointsChange: (hitPoints: number | null) => void;
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

const SummaryCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Card component="section" variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const FeatureList = ({
  features,
  characterLevel = 1,
}: {
  features: { name: string; level: number; description: string }[];
  characterLevel?: number;
}) => (
  <List dense disablePadding>
    {[...features]
      .sort((first, second) => first.level - second.level)
      .map((feature) => (
        <ListItem key={`${feature.level}-${feature.name}`} disableGutters alignItems="flex-start">
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle2">{feature.name}</Typography>
                <Chip
                  label={
                    feature.level <= characterLevel
                      ? `${feature.level}-й уровень`
                      : `с ${feature.level}-го уровня`
                  }
                  color={feature.level <= characterLevel ? 'primary' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            }
            secondary={feature.description}
            slotProps={{ secondary: { sx: { whiteSpace: 'pre-line' } } }}
          />
        </ListItem>
      ))}
  </List>
);

const SpellList = ({ title, spells }: { title: string; spells: Spell[] }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
      {title}
    </Typography>
    {spells.length > 0 ? (
      <List dense disablePadding>
        {spells.map((spell) => (
          <ListItem key={spell._id} disableGutters alignItems="flex-start">
            <ListItemText primary={spell.name} secondary={spell.description} />
          </ListItem>
        ))}
      </List>
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
  type: string;
  weight?: string;
  details: string;
  sourcePack?: string;
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

const getInventoryEntryFromSearchItem = (
  item: SearchInventoryItem,
  count: number,
  sourcePack?: string,
): InventoryEntry => {
  if (item.damage !== undefined) {
    return {
      name: item.name,
      count,
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
      type: 'Броня',
      weight: item.weight,
      details: `КД: ${item.classArmor}. Требование Силы: ${item.needStrong || 'нет'}. Помеха скрытности: ${item.Secrecy ? 'да' : 'нет'}.`,
      sourcePack,
    };
  }

  return {
    name: item.name,
    count,
    type: item.category || item.type || 'Снаряжение',
    weight: item.weight,
    details: item.detail || item.description || 'Описание отсутствует в справочнике.',
    sourcePack,
  };
};

export const CharacterSheet = ({
  race,
  characterClass,
  background,
  alignment,
  personality,
  abilityScores,
  selectedSkills,
  classConfiguration,
  characterName,
  currentHitPoints,
  onCharacterNameChange,
  onCurrentHitPointsChange,
}: CharacterSheetProps) => {
  const [tab, setTab] = useState(0);
  const { data: skillsData, loading: skillsLoading } = useFetch(fetchSkills);
  const { data: weaponsData } = useFetch(fetchWeapons);
  const { data: armorsData } = useFetch(fetchArmors);
  const skills = skillsData ?? [];
  const weapons = weaponsData ?? [];
  const armors = armorsData ?? [];

  const totalScores = useMemo(() => {
    const totals = { ...abilityScores };
    race.ability_bonuses.forEach(({ ability, bonus }) => {
      const key = abilityKeyFromName(ability);
      if (key) totals[key] += bonus;
    });
    return totals;
  }, [abilityScores, race.ability_bonuses]);

  const selectedSubclass = characterClass.subclasses.find(
    (subclass) => subclass.id === classConfiguration.subclass,
  );
  const equipmentNames = [
    ...characterClass.fixed_equipment.map((item) => item.name),
    ...classConfiguration.equipment.flat(),
  ];
  const selectedEquipment = new Set(equipmentNames.map(normalize));
  const selectedWeapons = weapons.filter((weapon) => selectedEquipment.has(normalize(weapon.name)));
  const selectedArmors = armors.filter((armor) => selectedEquipment.has(normalize(armor.name)));
  const inventorySources = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    const addItem = (name: string, count = 1) => {
      const key = normalize(name);
      const current = counts.get(key);
      counts.set(key, { name, count: (current?.count ?? 0) + count });
    };

    characterClass.fixed_equipment.forEach((item) => addItem(item.name, item.count));
    classConfiguration.equipment.flat().forEach((item) => addItem(item));
    classConfiguration.instruments?.forEach((instrument) => addItem(instrument));

    return [...counts.values()];
  }, [characterClass.fixed_equipment, classConfiguration.equipment, classConfiguration.instruments]);
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
            type: 'Снаряжение',
            details: 'Подробное описание не найдено в справочнике.',
          } satisfies InventoryEntry];
        }),
      );

      if (!cancelled) setResolvedInventoryEntries(entriesBySource.flat());
    };

    void loadInventoryDetails();

    return () => {
      cancelled = true;
    };
  }, [inventorySources]);

  const inventoryEntries = resolvedInventoryEntries ?? inventorySources.map((source) => ({
    ...source,
    type: 'Снаряжение',
    details: 'Загрузка подробностей предмета…',
  }));
  const totalWeight = inventoryEntries.reduce(
    (total, entry) => total + (getWeightInPounds(entry.weight) ?? 0) * entry.count,
    0,
  );
  const hasItemsWithoutWeight = inventoryEntries.some(
    (entry) => getWeightInPounds(entry.weight) === undefined,
  );

  const constitutionModifier = Math.floor((totalScores.con - 10) / 2);
  const dexterityModifier = Math.floor((totalScores.dex - 10) / 2);
  const hitPoints = Math.max(1, getHitDie(characterClass.hit_dice) + constitutionModifier);
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
  const firstLevelSlots = characterClass.spellcasting?.spell_slots_progression?.find(
    ({ level }) => level === 1,
  )?.slots;

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

      <SummaryCard title="Класс">
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
        <FeatureList features={characterClass.features} />
      </SummaryCard>

      <SummaryCard title="Характеристики и бой">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
          {ABILITIES.map(({ key, name, abbreviation }) => (
            <Paper key={key} variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {abbreviation}
              </Typography>
              <Typography variant="h5">{totalScores[key]}</Typography>
              <Typography color="secondary.main">{formatModifier(totalScores[key])}</Typography>
              <Typography variant="caption" color="text.secondary">
                {name}
              </Typography>
            </Paper>
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          <Typography>Макс. хиты: <strong>{hitPoints}</strong></Typography>
          <Typography>КД: <strong>{armorClass}</strong></Typography>
          <Typography>Инициатива: <strong>{formatModifier(totalScores.dex)}</strong></Typography>
          <Typography>Бонус мастерства: <strong>+2</strong></Typography>
        </Box>
      </SummaryCard>

      <SummaryCard title="Дополнительный класс">
        <Typography variant="body2" color="text.secondary">
          Дополнительный класс не выбран. Этот раздел заполнится после добавления выбора мультикласса в мастер.
        </Typography>
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
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Ячейки на 1-м уровне</Typography>
            <Typography variant="body2" color="text.secondary">
              {firstLevelSlots?.map((slots, index) => `${index + 1}: ${slots}`).join(' · ') || 'Нет ячеек'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <SpellList title="Заговоры" spells={classConfiguration.cantrips} />
            <SpellList title="Заклинания 1-го уровня" spells={classConfiguration.spells1} />
            {selectedSubclass?.class_spells && selectedSubclass.class_spells.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Заклинания подкласса</Typography>
                {selectedSubclass.class_spells.map(({ level_requirement, spells }) => (
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
              const modifier = abilityModifier + (selected ? 2 : 0);

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
        <Typography variant="subtitle2" color="text.secondary">
          Общий вес
        </Typography>
        <Typography variant="h4" color="secondary.main">
          {totalWeight.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} фнт.
        </Typography>
        {hasItemsWithoutWeight && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            В итог не включены предметы без веса в справочнике.
          </Typography>
        )}
      </Paper>

      {inventoryEntries.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {inventoryEntries.map((entry, index) => (
            <Card key={`${normalize(entry.name)}-${index}`} component="article" variant="outlined" sx={{ height: '100%' }}>
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
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <SummaryCard title="Инвентарь">
          <Typography variant="body2" color="text.secondary">Снаряжение не выбрано.</Typography>
        </SummaryCard>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Деньги пока не заданы.
      </Typography>
    </Box>
  );

  const tabPanels = [basicTab, combatTab, socialTab, inventoryTab];

  return (
    <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">Лист персонажа</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Персонаж 1-го уровня · {race.name} · {characterClass.name}
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 2fr) minmax(180px, 1fr)' },
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
            label={`Текущие ХП (максимум ${hitPoints})`}
            type="number"
            value={currentHitPoints ?? hitPoints}
            onChange={(event) => {
              const value = event.target.value;
              onCurrentHitPointsChange(
                value === '' ? null : Math.min(hitPoints, Math.max(0, Number(value))),
              );
            }}
            slotProps={{ htmlInput: { min: 0, max: hitPoints, step: 1 } }}
            fullWidth
          />
        </Box>
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
    </Box>
  );
};
