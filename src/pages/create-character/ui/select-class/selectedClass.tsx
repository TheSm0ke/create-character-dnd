import { Box, Typography,  Chip, Divider, useMediaQuery, useTheme } from '@mui/material';
import type { Class } from '../../../../api';

interface SelectClassProps {
  classes: Class[];
  selectedClass: Class | null;
  onSelectClass: (cls: Class) => void;
}

export const SelectClass = ({ classes, selectedClass, onSelectClass }: SelectClassProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
        Выберите класс
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {classes.map((cls) => {
          const isSelected = selectedClass?._id === cls._id;
          return (
            <Box
              key={cls._id}
              onClick={() => onSelectClass(cls)}
              sx={{
                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' },
                padding: isMobile ? '0px 20px 20px 20px' : '0px 25px 25px 25px',
                borderRadius: 2,
                border: '2px solid',
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : 'rgba(255,255,255,0.08)',
                backgroundColor: isSelected
                  ? 'rgba(170, 59, 255, 0.12)'
                  : 'transparent',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, border-color 0.3s ease, background-color 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  borderColor: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
                  backgroundColor: isSelected
                    ? 'rgba(170, 59, 255, 0.12)'
                    : 'rgba(255,255,255,0.03)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1.01)',
                },
                boxShadow: isSelected ? `0 0 20px ${theme.palette.primary.main}40` : 'none',
                maxHeight: 500,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.primary.main,
                  borderRadius: 4,
                },
              }}
            >
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: isSelected ? 'rgba(170, 59, 255, 0.12)' : 'transparent',
                  zIndex: 1,
                  paddingBottom: 1,
                  backdropFilter: 'blur(4px)',
                  borderRadius: '8px',
                }}
              >
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  {cls.name}
                  {cls.spellcasting && (
                    <span style={{ fontSize: '0.8rem', color: theme.palette.primary.main }}>✨</span>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5, fontSize: '0.9rem' }}>
                  {cls.description}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Кость HP</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{cls.hit_dice}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Осн. хар-ка</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{cls.primary_ability}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Спасброски</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{cls.proficiencies.saving_throws.join(', ')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Навыки</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
                    {cls.proficiencies.skills.number_to_choose} из {cls.proficiencies.skills.list.length}
                  </Typography>
                </Box>
              </Box>

              {(cls.proficiencies.armor.length > 0 || cls.proficiencies.weapons.length > 0 || cls.proficiencies.tools.length > 0) && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Владения</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {cls.proficiencies.armor.map((item) => (
                      <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
                    ))}
                    {cls.proficiencies.weapons.map((item) => (
                      <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
                    ))}
                    {cls.proficiencies.tools.map((item) => (
                      <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
                    ))}
                  </Box>
                </Box>
              )}

              {isSelected && (
                <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Выбран</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};