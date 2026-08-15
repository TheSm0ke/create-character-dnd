import { Box, Button, Card, CardContent, Chip, Divider, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import type { Alignment, Armor, Background, CharacterCurrency, Class, Race, Weapon } from '../../../../api';
import type { AbilityKey } from '../../../../api/classes';
import type { AbilityScores } from '../select-abilities';
import type { ClassConfiguration } from '../select-class/classSelection';
import { FeatureList, KiPoints, SpellSlots, SummaryCard } from './SheetPrimitives';
import { SpellList } from './SpellList';
import type { InventoryEntry, SearchInventoryItem } from './inventoryUtils';

type Skill = { _id: string; name: string; ability: string };
type Subclass = Class['subclasses'][number];
type Spellcasting = NonNullable<Class['spellcasting']>;

interface BasicTabProps {
  race: Race;
  characterClass: Class;
  characterLevel: number;
  selectedSubclass?: Subclass;
  classBackgroundImage?: string;
}

export const BasicTab = ({ race, characterClass, characterLevel, selectedSubclass, classBackgroundImage }: BasicTabProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
    <SummaryCard title="Раса">
      <Typography variant="h5">{race.name}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>{race.description}</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
        <Chip label={`Размер: ${race.size}`} size="small" />
        <Chip label={`Скорость: ${race.speed} фт.`} size="small" />
        {race.ability_bonuses.map(({ ability, bonus }) => (
          <Chip key={ability} label={`+${bonus} ${ability}`} color="secondary" size="small" />
        ))}
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Языки</Typography>
      <Typography variant="body2" color="text.secondary">
        {race.languages.map((language) => language.name).join(', ') || 'Нет данных'}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Черты расы</Typography>
      <FeatureList features={race.traits.map((trait) => ({ ...trait, level: 1 }))} />
    </SummaryCard>

    <SummaryCard title="Класс" backgroundImage={classBackgroundImage}>
      <Typography variant="h5">{characterClass.name}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>{characterClass.description}</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
        <Chip label={`Хиты: ${characterClass.hit_dice}`} color="secondary" size="small" />
        <Chip label={`Основная характеристика: ${characterClass.primary_ability}`} size="small" />
        {selectedSubclass && <Chip label={`Подкласс: ${selectedSubclass.name}`} color="primary" size="small" />}
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Владения</Typography>
      <Typography variant="body2" color="text.secondary">Доспехи: {characterClass.proficiencies.armor.join(', ') || 'нет'}</Typography>
      <Typography variant="body2" color="text.secondary">Оружие: {characterClass.proficiencies.weapons.join(', ') || 'нет'}</Typography>
      <Typography variant="body2" color="text.secondary">Инструменты: {characterClass.proficiencies.tools.join(', ') || 'нет'}</Typography>
      <Typography variant="body2" color="text.secondary">Спасброски: {characterClass.proficiencies.saving_throws.join(', ')}</Typography>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Умения класса</Typography>
      <FeatureList features={characterClass.features} characterLevel={characterLevel} />
      {selectedSubclass && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Подкласс: {selectedSubclass.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>{selectedSubclass.description}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1.5 }}>Особенности подкласса</Typography>
          <FeatureList features={selectedSubclass.features} characterLevel={characterLevel} />
        </>
      )}
    </SummaryCard>
  </Box>
);

interface CombatTabProps {
  selectedWeapons: Weapon[];
  selectedArmors: Armor[];
  characterLevel: number;
  effectiveSpellcasting?: Spellcasting;
  classConfiguration: ClassConfiguration;
  kiPoints: number;
  slotResetVersion: number;
  currentLevelSlots?: number[];
  remainingSpellSlots?: number[];
  maximumAvailableSpellLevel?: number;
  unlockedSubclassSpells: Array<{ level_requirement: number; spells: string[] }>;
  onRestoreSlots: () => void;
  onSpellSlotAvailabilityChange: (slots: number[]) => void;
}

export const CombatTab = ({
  selectedWeapons, selectedArmors, characterLevel, effectiveSpellcasting, classConfiguration, kiPoints,
  slotResetVersion, currentLevelSlots, remainingSpellSlots, maximumAvailableSpellLevel, unlockedSubclassSpells,
  onRestoreSlots, onSpellSlotAvailabilityChange,
}: CombatTabProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <SummaryCard title="Оружие и броня">
      {selectedWeapons.length > 0 && (
        <><Typography variant="subtitle2">Оружие</Typography><List dense disablePadding>
          {selectedWeapons.map((weapon) => <ListItem key={weapon._id} disableGutters><ListItemText primary={weapon.name} secondary={`${weapon.damage ?? '—'} ${weapon.damageType ?? ''} · ${weapon.properties.map((property) => property.name).join(', ') || 'без свойств'}`} /></ListItem>)}
        </List></>
      )}
      {selectedArmors.length > 0 && (
        <><Typography variant="subtitle2" sx={{ mt: 1 }}>Броня</Typography><List dense disablePadding>
          {selectedArmors.map((armor) => <ListItem key={armor._id} disableGutters><ListItemText primary={armor.name} secondary={`КД: ${armor.classArmor}; Сила: ${armor.needStrong || 'нет'}; Помеха скрытности: ${armor.Secrecy ? 'да' : 'нет'}`} /></ListItem>)}
        </List></>
      )}
      {selectedWeapons.length === 0 && selectedArmors.length === 0 && <Typography variant="body2" color="text.secondary">Снаряжение не выбрано.</Typography>}
    </SummaryCard>
    <SummaryCard title="Магия">
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}><Button size="small" variant="outlined" onClick={onRestoreSlots}>Восстановить ячейки</Button></Box>
      {kiPoints > 0 && <><Typography variant="subtitle2">Ци: {kiPoints}</Typography><KiPoints key={`ki-${characterLevel}-${kiPoints}-${slotResetVersion}`} points={kiPoints} /><Divider sx={{ my: 2 }} /></>}
      {effectiveSpellcasting ? (
        <>
          <Typography variant="body2" color="text.secondary">Базовая характеристика: {effectiveSpellcasting.ability}. Фокус: {effectiveSpellcasting.focus || 'не указан'}.</Typography>
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Ячейки на {characterLevel}-м уровне</Typography>
          <SpellSlots key={`spell-slots-${characterLevel}-${slotResetVersion}`} slots={currentLevelSlots} onAvailabilityChange={onSpellSlotAvailabilityChange} />
          <Divider sx={{ my: 2 }} />
          <SpellList title="Заговоры" spells={classConfiguration.cantrips} />
          <SpellList title="Заклинания" spells={classConfiguration.spells1} maximumAvailableSpellLevel={maximumAvailableSpellLevel} availableSlots={remainingSpellSlots} />
          {unlockedSubclassSpells.length > 0 && <><Divider sx={{ my: 2 }} /><Typography variant="subtitle2">Заклинания подкласса</Typography>
            {unlockedSubclassSpells.map(({ level_requirement, spells }) => <Box key={level_requirement} sx={{ mt: 1 }}><Chip label={`${level_requirement}-й уровень`} size="small" variant="outlined" /><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{spells.join(', ')}</Typography></Box>)}
          </>}
        </>
      ) : <Typography variant="body2" color="text.secondary">Этот класс не использует заклинания.</Typography>}
    </SummaryCard>
  </Box>
);

interface SocialTabProps {
  background: Background;
  backgroundSkills: string[];
  skillsLoading: boolean;
  allSkills: Skill[];
  proficientSkills: Set<string>;
  userSelectedSkills: Set<string>;
  totalScores: AbilityScores;
  proficiencyBonus: number;
  alignment: Alignment;
  personality: { traits: string[]; ideals: string[]; bonds: string[]; flaws: string[] };
  abilityKeyFromName: (name: string) => AbilityKey | undefined;
}

export const SocialTab = ({ background, backgroundSkills, skillsLoading, allSkills, proficientSkills, userSelectedSkills, totalScores, proficiencyBonus, alignment, personality, abilityKeyFromName }: SocialTabProps) => {
  const personalitySections = [
    { title: 'Черты характера', values: personality.traits }, { title: 'Идеалы', values: personality.ideals },
    { title: 'Привязанности', values: personality.bonds }, { title: 'Слабости', values: personality.flaws },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
      <SummaryCard title="Навыки">
        {backgroundSkills.length > 0 && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Происхождение «{background.name}»: {backgroundSkills.join(', ')}</Typography>}
        {skillsLoading ? <Typography variant="body2" color="text.secondary">Загрузка навыков…</Typography> : allSkills.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
            {allSkills.map((skill) => {
              const selected = proficientSkills.has(skill.name.trim().toLocaleLowerCase('ru-RU'));
              const selectedByUser = userSelectedSkills.has(skill.name.trim().toLocaleLowerCase('ru-RU'));
              const abilityKey = abilityKeyFromName(skill.ability);
              const modifier = (abilityKey ? Math.floor((totalScores[abilityKey] - 10) / 2) : 0) + (selected ? proficiencyBonus : 0);
              return <Paper key={skill._id} variant="outlined" sx={{ p: 1, borderColor: selected ? 'primary.main' : 'divider', backgroundColor: selected ? 'action.selected' : 'background.paper' }}><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Box><Typography variant="subtitle2">{skill.name}</Typography><Typography variant="caption" color="text.secondary">{skill.ability}{selectedByUser ? ' · выбрано пользователем' : selected ? ' · владение' : ''}</Typography></Box><Box sx={{ textAlign: 'right' }}><Typography variant="h6" color="secondary.main">{modifier >= 0 ? `+${modifier}` : modifier}</Typography>{selected && <Chip label={selectedByUser ? 'Выбрано' : 'Владение'} color="primary" size="small" />}</Box></Box></Paper>;
            })}
          </Box>
        ) : <Typography variant="body2" color="text.secondary">Справочник навыков недоступен.</Typography>}
      </SummaryCard>
      <SummaryCard title="Характер и мировоззрение">
        <Chip label={`${alignment.name} (${alignment.abbreviation})`} color="primary" sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">{alignment.description}</Typography>
        {personalitySections.map(({ title, values }) => <Box key={title} sx={{ mt: 2 }}><Typography variant="subtitle2">{title}</Typography><List dense disablePadding>{values.map((value) => <ListItem key={value} disableGutters><ListItemText primary={value} /></ListItem>)}</List></Box>)}
      </SummaryCard>
    </Box>
  );
};

interface InventoryTabProps {
  carriedWeight: number;
  carryingCapacity: number;
  isOverCarryingCapacity: boolean;
  hasItemsWithoutWeight: boolean;
  currency: CharacterCurrency;
  currencyValueCp: number;
  coinCount: number;
  currencyWeight: number;
  inventoryEntries: InventoryEntry[];
  removalCounts: Record<string, number>;
  onOpenAddItem: () => void;
  onCurrencyChange?: (currency: CharacterCurrency) => void;
  onRemovalCountChange: (key: string, count: number) => void;
  onRemoveItem: (entry: InventoryEntry, quantity: number) => void;
}

export const InventoryTab = ({ carriedWeight, carryingCapacity, isOverCarryingCapacity, hasItemsWithoutWeight, currency, currencyValueCp, coinCount, currencyWeight, inventoryEntries, removalCounts, onOpenAddItem, onCurrencyChange, onRemovalCountChange, onRemoveItem }: InventoryTabProps) => (
  <Box>
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}><Box><Typography variant="subtitle2" color="text.secondary">Общий вес</Typography><Typography variant="h4"><Box component="span" sx={{ color: isOverCarryingCapacity ? 'error.main' : 'secondary.main' }}>{carriedWeight.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</Box>{' / '}{carryingCapacity.toLocaleString('ru-RU')} фнт.</Typography><Typography variant="body2" color="text.secondary">Максимальная нагрузка рассчитывается как Сила × 15.</Typography></Box><Button variant="contained" onClick={onOpenAddItem}>Добавить предмет</Button></Box>{hasItemsWithoutWeight && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>В итог не включены предметы без веса в справочнике.</Typography>}{isOverCarryingCapacity && <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>Превышен максимальный переносимый вес.</Typography>}</Paper>
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}><Typography variant="subtitle1" sx={{ mb: 1.5 }}>Кошелёк</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(5, minmax(0, 1fr))' }, gap: 1.25 }}>{([['platinum', 'Платина'], ['gold', 'Золото'], ['electrum', 'Электрум'], ['silver', 'Серебро'], ['copper', 'Медь']] as Array<[keyof CharacterCurrency, string]>).map(([key, label]) => <TextField key={key} label={label} type="number" value={currency[key] ?? 0} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) onCurrencyChange?.({ ...currency, [key]: Math.max(0, Math.floor(value)) }); }} slotProps={{ htmlInput: { min: 0, step: 1 } }} size="small" disabled={!onCurrencyChange} />)}</Box><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Всего: {currencyValueCp.toLocaleString('ru-RU')} мм · {(currencyValueCp / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} зм{coinCount > 0 && ` · Вес монет: ${currencyWeight.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} фнт.`}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Курс: 10 мм = 1 см, 5 см = 1 эм, 2 эм = 1 зм, 10 зм = 1 пм. 50 монет весят 1 фнт.</Typography></Paper>
    {inventoryEntries.length > 0 ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>{inventoryEntries.map((entry, index) => { const entryKey = `${entry.sourceName.trim().toLocaleLowerCase('ru-RU')}-${index}`; const removalCount = Math.min(entry.editableCount, Math.max(1, removalCounts[entryKey] ?? 1)); return <Card key={entryKey} component="article" variant="outlined" sx={{ height: '100%' }}><CardContent><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}><Typography variant="h6" component="h2">{entry.name}</Typography>{entry.count > 1 && <Chip label={`×${entry.count}`} color="primary" size="small" />}</Box><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}><Chip label={entry.type} size="small" variant="outlined" /><Chip label={entry.weight ? `${entry.weight} × ${entry.count}` : 'Вес неизвестен'} color="secondary" size="small" />{entry.sourcePack && <Chip label={`Набор: ${entry.sourcePack}`} size="small" />}</Box><Typography variant="body2" color="text.secondary">{entry.details}</Typography><Divider sx={{ my: 1.5 }} /><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>{entry.editableCount > 1 && <TextField label="Количество" type="number" value={removalCount} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) onRemovalCountChange(entryKey, Math.max(1, Math.min(entry.editableCount, value))); }} slotProps={{ htmlInput: { min: 1, max: entry.editableCount, step: 1 } }} size="small" sx={{ width: 132 }} />}<Button size="small" color="error" onClick={() => onRemoveItem(entry, removalCount)}>Удалить</Button>{entry.editableCount > removalCount && <Button size="small" color="error" onClick={() => onRemoveItem(entry, entry.editableCount)}>Удалить всё</Button>}</Box></CardContent></Card>; })}</Box> : <SummaryCard title="Инвентарь"><Typography variant="body2" color="text.secondary">Снаряжение не выбрано.</Typography></SummaryCard>}
  </Box>
);

export type { SearchInventoryItem };
