import { Box, Button, Divider, FormControlLabel, InputAdornment, Paper, Switch, TextField, Typography } from '@mui/material';
import type { AbilityKey } from '../../../../api/classes';
import type { AbilityScores } from '../select-abilities';

interface AbilityDefinition { key: AbilityKey; name: string; abbreviation: string }

interface CharacterOverviewProps {
  abilities: AbilityDefinition[];
  characterName: string;
  characterLevel: number;
  experience: number;
  hitPoints: number;
  currentHitPoints: number | null;
  totalScores: AbilityScores;
  baseScores: AbilityScores;
  armorClass: number;
  proficiencyBonus: number;
  abilityEditing: boolean;
  levelChangePending: boolean;
  canEditAbilities: boolean;
  onNameChange: (name: string) => void;
  onCurrentHitPointsChange: (value: number | null) => void;
  onIncreaseLevel: () => void;
  onDecreaseLevel: () => void;
  onExperienceChange: (experience: number) => void;
  onAbilityEditingChange: (enabled: boolean) => void;
  onBaseScoresChange?: (scores: AbilityScores) => void;
}

const formatModifier = (score: number) => {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
};

export const CharacterOverview = ({ abilities, characterName, characterLevel, experience, hitPoints, currentHitPoints, totalScores, baseScores, armorClass, proficiencyBonus, abilityEditing, levelChangePending, canEditAbilities, onNameChange, onCurrentHitPointsChange, onIncreaseLevel, onDecreaseLevel, onExperienceChange, onAbilityEditingChange, onBaseScoresChange }: CharacterOverviewProps) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) repeat(3, minmax(140px, 1fr))' }, gap: 2 }}>
      <TextField label="Имя персонажа" value={characterName} onChange={(event) => onNameChange(event.target.value)} fullWidth />
      <TextField label="Хиты" type="number" value={currentHitPoints ?? hitPoints} onChange={(event) => { const value = event.target.value; onCurrentHitPointsChange(value === '' ? null : Math.min(hitPoints, Math.max(0, Number(value)))); }} slotProps={{ htmlInput: { min: 0, max: hitPoints, step: 1 }, input: { endAdornment: <InputAdornment position="end">/ {hitPoints}</InputAdornment> } }} fullWidth />
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.75 }}><Button aria-label="Понизить уровень" onClick={onDecreaseLevel} disabled={characterLevel <= 1 || levelChangePending} variant="outlined">−</Button><TextField label="Уровень" value={characterLevel} slotProps={{ input: { readOnly: true } }} fullWidth /><Button aria-label="Повысить уровень" onClick={onIncreaseLevel} disabled={characterLevel >= 20 || levelChangePending} variant="contained">+</Button></Box>
      <TextField label="Опыт" type="number" value={experience} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) onExperienceChange(Math.max(0, value)); }} slotProps={{ htmlInput: { min: 0, step: 1 } }} fullWidth />
    </Box>
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1 }}><Typography variant="subtitle2">Характеристики</Typography><FormControlLabel label="Ручной ввод" control={<Switch checked={abilityEditing} disabled={!canEditAbilities} onChange={(event) => onAbilityEditingChange(event.target.checked)} />} /></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
      {abilities.map(({ key, name, abbreviation }) => <Paper key={key} variant="outlined" sx={{ p: 1, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">{abbreviation}</Typography>{abilityEditing ? <TextField aria-label={name} type="number" value={totalScores[key]} onChange={(event) => { const value = Number(event.target.value); if (!Number.isFinite(value)) return; const racialBonus = totalScores[key] - baseScores[key]; onBaseScoresChange?.({ ...baseScores, [key]: Math.max(1, Math.min(30 - racialBonus, value - racialBonus)) }); }} slotProps={{ htmlInput: { min: 1, max: 30, step: 1 } }} size="small" sx={{ mt: 0.5, maxWidth: 88 }} /> : <Typography variant="h5">{totalScores[key]}</Typography>}<Typography color="secondary.main">{formatModifier(totalScores[key])}</Typography><Typography variant="caption" color="text.secondary">{name}</Typography></Paper>)}
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1, mt: 2 }}><Typography>КД: <strong>{armorClass}</strong></Typography><Typography>Инициатива: <strong>{formatModifier(totalScores.dex)}</strong></Typography><Typography>Бонус мастерства: <strong>+{proficiencyBonus}</strong></Typography></Box>
    {!characterName.trim() && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Укажите имя, чтобы создать персонажа.</Typography>}
  </Paper>
);
