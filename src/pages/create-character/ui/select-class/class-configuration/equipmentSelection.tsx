// src/pages/create-character/ui/select-class/class-configuration/equipmentSelection.tsx
import { Box, Typography, useTheme } from '@mui/material';
import type { EquipmentItem, EquipmentChoice } from '../../../../../api/classes';

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
              <Box
                key={optIdx}
                role="button"
                tabIndex={0}
                onClick={() => onChange(idx, optIdx)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onChange(idx, optIdx);
                  }
                }}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' },
                  p: 2,
                  border: '2px solid',
                  borderColor: selected[idx] === optIdx ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: selected[idx] === optIdx ? 'action.selected' : 'background.paper',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Typography variant="body2">
                  {option
                    .map((item) => `${item.name}${item.count > 1 ? ` (×${item.count})` : ''}`)
                    .join(', ')}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
