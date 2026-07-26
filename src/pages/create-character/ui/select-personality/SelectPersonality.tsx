import { Box, Typography, useTheme, Paper, useMediaQuery, Button } from '@mui/material';
import { useState } from 'react';

interface Personality {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

interface SelectPersonalityProps {
  personality: Personality;
  onConfirm: (selected: { traits: string[]; ideals: string[]; bonds: string[]; flaws: string[] }) => void;
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

  const handleToggle = (list: string[], setList: (v: string[]) => void, max: number, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else if (list.length < max) {
      setList([...list, value]);
    }
  };

  const isComplete = selectedTraits.length >= 2 && selectedIdeals.length >= 1 && selectedBonds.length >= 1 && selectedFlaws.length >= 1;

  const handleConfirm = () => {
    if (isComplete) {
      onConfirm({
        traits: selectedTraits,
        ideals: selectedIdeals,
        bonds: selectedBonds,
        flaws: selectedFlaws,
      });
    }
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
              onToggle={() => handleToggle(selectedTraits, setSelectedTraits, 2, trait)}
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
              onToggle={() => handleToggle(selectedIdeals, setSelectedIdeals, 1, ideal)}
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
              onToggle={() => handleToggle(selectedBonds, setSelectedBonds, 1, bond)}
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
              onToggle={() => handleToggle(selectedFlaws, setSelectedFlaws, 1, flaw)}
            />
          ))}
        </Box>
      </Box>

      {/* Кнопка подтверждения */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!isComplete}
          sx={{ minWidth: 150 }}
        >
          Подтвердить
        </Button>
      </Box>
    </Box>
  );
};