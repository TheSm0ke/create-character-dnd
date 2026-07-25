/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface FixedEquipmentDisplayProps {
  fixedEquipment: any[];
}

export const FixedEquipmentDisplay: React.FC<FixedEquipmentDisplayProps> = ({ fixedEquipment }) => {
  const theme = useTheme();
  if (fixedEquipment.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
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
  );
};