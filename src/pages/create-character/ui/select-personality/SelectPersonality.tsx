import { Box, Typography, useTheme, Paper, useMediaQuery } from '@mui/material';
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

const PersonalityCard = ({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) => {
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
        transition: 'all 0.25s ease',
        '&:hover': {
          borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
          backgroundColor: selected ? 'rgba(170, 59, 255, 0.12)' : 'rgba(255,255,255,0.03)',
          transform: 'scale(1.02)',
        },
      }}
    >
      <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
        {label}
      </Typography>
    </Paper>
  );
};

export const SelectPersonality = ({ personality, onConfirm }: SelectPersonalityProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedIdeals, setSelectedIdeals] = useState<string[]>([]);
  const [selectedBonds, setSelectedBonds] = useState<string[]>([]);
  const [selectedFlaws, setSelectedFlaws] = useState<string[]>([]);

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

  const handleIdealsToggle = (value: string) => {
    const nextIdeals = toggleValue(selectedIdeals, 1, value);
    setSelectedIdeals(nextIdeals);
    notifySelection(selectedTraits, nextIdeals, selectedBonds, selectedFlaws);
  };

  const handleBondsToggle = (value: string) => {
    const nextBonds = toggleValue(selectedBonds, 1, value);
    setSelectedBonds(nextBonds);
    notifySelection(selectedTraits, selectedIdeals, nextBonds, selectedFlaws);
  };

  const handleFlawsToggle = (value: string) => {
    const nextFlaws = toggleValue(selectedFlaws, 1, value);
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
          {personality.traits.map((trait) => (
            <PersonalityCard
              key={trait}
              label={trait}
              selected={selectedTraits.includes(trait)}
              onToggle={() => handleTraitsToggle(trait)}
            />
          ))}
        </Box>
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
          {personality.ideals.map((ideal) => (
            <PersonalityCard
              key={ideal}
              label={ideal}
              selected={selectedIdeals.includes(ideal)}
              onToggle={() => handleIdealsToggle(ideal)}
            />
          ))}
        </Box>
      </Box>

      {/* Bonds */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Связи (выберите 1)
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {selectedBonds.length}/1
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${getOtherColumns()}, 1fr)`, gap: 1.5 }}>
          {personality.bonds.map((bond) => (
            <PersonalityCard
              key={bond}
              label={bond}
              selected={selectedBonds.includes(bond)}
              onToggle={() => handleBondsToggle(bond)}
            />
          ))}
        </Box>
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
          {personality.flaws.map((flaw) => (
            <PersonalityCard
              key={flaw}
              label={flaw}
              selected={selectedFlaws.includes(flaw)}
              onToggle={() => handleFlawsToggle(flaw)}
            />
          ))}
        </Box>
      </Box>

    </Box>
  );
};
