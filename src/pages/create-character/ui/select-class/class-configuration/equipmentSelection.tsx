// src/pages/create-character/ui/select-class/class-configuration/equipmentSelection.tsx
import { Box, Typography, useTheme } from '@mui/material';
import type { EquipmentItem, EquipmentChoice } from '../../../../../api/classes';
import { EquipmentOptionCard } from './equipmentOptionCard';

interface Props {
  fixedEquipment: EquipmentItem[];
  choices: EquipmentChoice[];
  selected: { [key: number]: number };
  onChange: (choiceIndex: number, optionIndex: number) => void;
}

export const EquipmentSelection = ({
  fixedEquipment,
  choices,
  selected,
  onChange,
}: Props) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      {fixedEquipment.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Вы получаете:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            {fixedEquipment.map((item, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: theme.palette.common.white, mr: 1 }}>
                • {item.name} {item.count > 1 && `(×${item.count})`}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {choices.map((choice, idx) => (
        <Box key={idx} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            {choice.description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
            {choice.options.map((option, optIdx) => (
              <Box key={optIdx} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' } }}>
                <EquipmentOptionCard
                  items={option}
                  selected={selected[idx] === optIdx}
                  onToggle={() => onChange(idx, optIdx)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};