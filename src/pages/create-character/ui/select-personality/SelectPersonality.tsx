import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

interface Personality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

interface SelectPersonalityProps {
  personality: Personality;
  onConfirm: (selected: { traits: string[]; ideals: string[]; bonds: string[]; flaws: string[] } | null) => void;
}

const PersonalityCard = ({
  label,
  selected,
  onToggle,
  onDelete,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      onClick={onToggle}
      sx={{
        p: 1.5,
        border: '2px solid',
        borderColor: selected ? theme.palette.primary.main : 'rgba(255,255,255,0.08)',
        borderRadius: 2,
        backgroundColor: selected ? 'rgba(170, 59, 255, 0.12)' : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
          backgroundColor: selected ? 'rgba(170, 59, 255, 0.12)' : 'rgba(255,255,255,0.03)',
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Typography variant="body2" sx={{ color: theme.palette.common.white, flexGrow: 1 }}>
          {label}
        </Typography>
        {onDelete && (
          <Button
            size="small"
            color="error"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            sx={{ minWidth: 0, px: 1 }}
          >
            Удалить
          </Button>
        )}
      </Box>
    </Paper>
  );
};

const CustomValueInput = ({
  label,
  value,
  disabled,
  onChange,
  onAdd,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onAdd: () => void;
}) => (
  <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onAdd();
        }
      }}
      disabled={disabled}
    />
    <Button variant="outlined" onClick={onAdd} disabled={!value.trim() || disabled}>
      Добавить
    </Button>
  </Box>
);

export const SelectPersonality = ({ personality, onConfirm }: SelectPersonalityProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedIdeals, setSelectedIdeals] = useState<string[]>([]);
  const [selectedBonds, setSelectedBonds] = useState<string[]>([]);
  const [selectedFlaws, setSelectedFlaws] = useState<string[]>([]);
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [customTraitValue, setCustomTraitValue] = useState('');
  const [customIdeals, setCustomIdeals] = useState<string[]>([]);
  const [customIdealValue, setCustomIdealValue] = useState('');
  const [customBonds, setCustomBonds] = useState<string[]>([]);
  const [customBondValue, setCustomBondValue] = useState('');
  const [customFlaws, setCustomFlaws] = useState<string[]>([]);
  const [customFlawValue, setCustomFlawValue] = useState('');

  const toggleValue = (list: string[], max: number, value: string) => {
    if (list.includes(value)) return list.filter((item) => item !== value);
    return list.length < max ? [...list, value] : list;
  };

  const notifySelection = (traits: string[], ideals: string[], bonds: string[], flaws: string[]) => {
    const isComplete = traits.length >= 2 && ideals.length >= 1 && bonds.length >= 1 && flaws.length >= 1;
    onConfirm(isComplete ? { traits, ideals, bonds, flaws } : null);
  };

  const handleTraitsToggle = (value: string) => {
    const nextTraits = toggleValue(selectedTraits, 2, value);
    setSelectedTraits(nextTraits);
    notifySelection(nextTraits, selectedIdeals, selectedBonds, selectedFlaws);
  };

  const handleAddCustomTrait = () => {
    const trait = customTraitValue.trim();
    const allTraits = [...personality.traits, ...customTraits];

    if (!trait || allTraits.includes(trait) || selectedTraits.length >= 2) return;

    const nextTraits = [...selectedTraits, trait];
    setCustomTraits((current) => [...current, trait]);
    setSelectedTraits(nextTraits);
    setCustomTraitValue('');
    notifySelection(nextTraits, selectedIdeals, selectedBonds, selectedFlaws);
  };

  const handleDeleteCustomTrait = (trait: string) => {
    const nextTraits = selectedTraits.filter((value) => value !== trait);
    setCustomTraits((current) => current.filter((value) => value !== trait));
    setSelectedTraits(nextTraits);
    notifySelection(nextTraits, selectedIdeals, selectedBonds, selectedFlaws);
  };

  const handleIdealsToggle = (value: string) => {
    const nextIdeals = toggleValue(selectedIdeals, 1, value);
    setSelectedIdeals(nextIdeals);
    notifySelection(selectedTraits, nextIdeals, selectedBonds, selectedFlaws);
  };

  const handleAddCustomIdeal = () => {
    const ideal = customIdealValue.trim();
    const allIdeals = [...personality.ideals, ...customIdeals];
    if (!ideal || allIdeals.includes(ideal) || selectedIdeals.length >= 1) return;

    const nextIdeals = [...selectedIdeals, ideal];
    setCustomIdeals((current) => [...current, ideal]);
    setSelectedIdeals(nextIdeals);
    setCustomIdealValue('');
    notifySelection(selectedTraits, nextIdeals, selectedBonds, selectedFlaws);
  };

  const handleDeleteCustomIdeal = (ideal: string) => {
    const nextIdeals = selectedIdeals.filter((value) => value !== ideal);
    setCustomIdeals((current) => current.filter((value) => value !== ideal));
    setSelectedIdeals(nextIdeals);
    notifySelection(selectedTraits, nextIdeals, selectedBonds, selectedFlaws);
  };

  const handleBondsToggle = (value: string) => {
    const nextBonds = toggleValue(selectedBonds, 1, value);
    setSelectedBonds(nextBonds);
    notifySelection(selectedTraits, selectedIdeals, nextBonds, selectedFlaws);
  };

  const handleAddCustomBond = () => {
    const bond = customBondValue.trim();
    const allBonds = [...personality.bonds, ...customBonds];
    if (!bond || allBonds.includes(bond) || selectedBonds.length >= 1) return;

    const nextBonds = [...selectedBonds, bond];
    setCustomBonds((current) => [...current, bond]);
    setSelectedBonds(nextBonds);
    setCustomBondValue('');
    notifySelection(selectedTraits, selectedIdeals, nextBonds, selectedFlaws);
  };

  const handleDeleteCustomBond = (bond: string) => {
    const nextBonds = selectedBonds.filter((value) => value !== bond);
    setCustomBonds((current) => current.filter((value) => value !== bond));
    setSelectedBonds(nextBonds);
    notifySelection(selectedTraits, selectedIdeals, nextBonds, selectedFlaws);
  };

  const handleFlawsToggle = (value: string) => {
    const nextFlaws = toggleValue(selectedFlaws, 1, value);
    setSelectedFlaws(nextFlaws);
    notifySelection(selectedTraits, selectedIdeals, selectedBonds, nextFlaws);
  };

  const handleAddCustomFlaw = () => {
    const flaw = customFlawValue.trim();
    const allFlaws = [...personality.flaws, ...customFlaws];
    if (!flaw || allFlaws.includes(flaw) || selectedFlaws.length >= 1) return;

    const nextFlaws = [...selectedFlaws, flaw];
    setCustomFlaws((current) => [...current, flaw]);
    setSelectedFlaws(nextFlaws);
    setCustomFlawValue('');
    notifySelection(selectedTraits, selectedIdeals, selectedBonds, nextFlaws);
  };

  const handleDeleteCustomFlaw = (flaw: string) => {
    const nextFlaws = selectedFlaws.filter((value) => value !== flaw);
    setCustomFlaws((current) => current.filter((value) => value !== flaw));
    setSelectedFlaws(nextFlaws);
    notifySelection(selectedTraits, selectedIdeals, selectedBonds, nextFlaws);
  };

  const getTraitsColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const getOtherColumns = () => {
    if (isMobile) return 1;
    return 2;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
        Выберите черты характера
      </Typography>

      {/* Traits */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Черты характера (выберите 2)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {selectedTraits.length}/2
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${getTraitsColumns()}, 1fr)`, gap: 1.5 }}>
          {[...personality.traits, ...customTraits].map((trait) => {
            const isCustomTrait = customTraits.includes(trait);

            return (
              <PersonalityCard
                key={trait}
                label={trait}
                selected={selectedTraits.includes(trait)}
                onToggle={() => handleTraitsToggle(trait)}
                onDelete={isCustomTrait ? () => handleDeleteCustomTrait(trait) : undefined}
              />
            );
          })}
        </Box>
        <CustomValueInput
          label="Своя черта характера"
          value={customTraitValue}
          disabled={selectedTraits.length >= 2}
          onChange={setCustomTraitValue}
          onAdd={handleAddCustomTrait}
        />
      </Box>

      {/* Ideals */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Идеалы (выберите 1)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {selectedIdeals.length}/1
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${getOtherColumns()}, 1fr)`, gap: 1.5 }}>
          {[...personality.ideals, ...customIdeals].map((ideal) => {
            const isCustomIdeal = customIdeals.includes(ideal);

            return (
              <PersonalityCard
                key={ideal}
                label={ideal}
                selected={selectedIdeals.includes(ideal)}
                onToggle={() => handleIdealsToggle(ideal)}
                onDelete={isCustomIdeal ? () => handleDeleteCustomIdeal(ideal) : undefined}
              />
            );
          })}
        </Box>
        <CustomValueInput
          label="Свой идеал"
          value={customIdealValue}
          disabled={selectedIdeals.length >= 1}
          onChange={setCustomIdealValue}
          onAdd={handleAddCustomIdeal}
        />
      </Box>

      {/* Bonds */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Привязанность (выберите 1)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {selectedBonds.length}/1
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${getOtherColumns()}, 1fr)`, gap: 1.5 }}>
          {[...personality.bonds, ...customBonds].map((bond) => {
            const isCustomBond = customBonds.includes(bond);

            return (
              <PersonalityCard
                key={bond}
                label={bond}
                selected={selectedBonds.includes(bond)}
                onToggle={() => handleBondsToggle(bond)}
                onDelete={isCustomBond ? () => handleDeleteCustomBond(bond) : undefined}
              />
            );
          })}
        </Box>
        <CustomValueInput
          label="Своя привязанность"
          value={customBondValue}
          disabled={selectedBonds.length >= 1}
          onChange={setCustomBondValue}
          onAdd={handleAddCustomBond}
        />
      </Box>

      {/* Flaws */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Недостатки (выберите 1)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {selectedFlaws.length}/1
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${getOtherColumns()}, 1fr)`, gap: 1.5 }}>
          {[...personality.flaws, ...customFlaws].map((flaw) => {
            const isCustomFlaw = customFlaws.includes(flaw);

            return (
              <PersonalityCard
                key={flaw}
                label={flaw}
                selected={selectedFlaws.includes(flaw)}
                onToggle={() => handleFlawsToggle(flaw)}
                onDelete={isCustomFlaw ? () => handleDeleteCustomFlaw(flaw) : undefined}
              />
            );
          })}
        </Box>
        <CustomValueInput
          label="Своя слабость"
          value={customFlawValue}
          disabled={selectedFlaws.length >= 1}
          onChange={setCustomFlawValue}
          onAdd={handleAddCustomFlaw}
        />
      </Box>

    </Box>
  );
};
