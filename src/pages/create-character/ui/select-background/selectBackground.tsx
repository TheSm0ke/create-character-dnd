import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Modal,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { Background } from './Background';
import type { Background as BackgroundType, Language } from '../../../../api';
import { getBackgroundLanguageChoiceCount } from './languageChoices';

interface SelectBackgroundProps {
  backgrounds: BackgroundType[];
  languages: Language[];
  selectedBackground: BackgroundType | null;
  selectedBackgroundLanguages: string[];
  onSelectBackground: (bg: BackgroundType) => void;
  onSelectedBackgroundLanguagesChange: (languages: string[]) => void;
}

export const SelectBackground = ({
  backgrounds,
  languages,
  selectedBackground,
  selectedBackgroundLanguages,
  onSelectBackground,
  onSelectedBackgroundLanguagesChange,
}: SelectBackgroundProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3; // или 4, если нужно больше колонок
  };
  const languageChoiceCount = selectedBackground
    ? getBackgroundLanguageChoiceCount(selectedBackground.languages)
    : 0;
  const selectedLanguageOptions = languages.filter((language) =>
    selectedBackgroundLanguages.includes(language.name),
  );

  const handleLanguageToggle = (language: Language) => {
    const isSelected = selectedBackgroundLanguages.includes(language.name);

    if (isSelected) {
      onSelectedBackgroundLanguagesChange(
        selectedBackgroundLanguages.filter((name) => name !== language.name),
      );
      return;
    }

    if (selectedBackgroundLanguages.length >= languageChoiceCount) return;

    onSelectedBackgroundLanguagesChange([
      ...selectedBackgroundLanguages,
      language.name,
    ]);
  };

  const handleBackgroundSelect = (background: BackgroundType) => {
    onSelectBackground(background);
    setIsLanguageDialogOpen(
      getBackgroundLanguageChoiceCount(background.languages) > 0,
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
        Выбор происхождения
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
          gap: 2,
        }}
      >
        {backgrounds.map((bg) => (
          <Background
            key={bg._id}
            {...bg}
            selected={selectedBackground?._id === bg._id}
            onSelect={() => handleBackgroundSelect(bg)}
          />
        ))}
      </Box>
      {selectedBackground && languageChoiceCount > 0 && (
        <Paper component="section" variant="outlined" sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" component="h2">
            Выбор языка
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Предыстория «{selectedBackground.name}» позволяет выбрать: {languageChoiceCount}.
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setIsLanguageDialogOpen(true)}
            sx={{ justifyContent: 'space-between', textTransform: 'none' }}
          >
            {selectedLanguageOptions.length > 0
              ? selectedLanguageOptions.map((language) => language.name).join(', ')
              : 'Выбрать языки'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Выбрано {selectedBackgroundLanguages.length} из {languageChoiceCount}
          </Typography>

          <Modal
            open={isLanguageDialogOpen}
            onClose={() => setIsLanguageDialogOpen(false)}
            aria-labelledby="language-selection-title"
            aria-describedby="language-selection-description"
          >
            <Box
              role="dialog"
              aria-modal="true"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(960px, calc(100vw - 32px))',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: 24,
                outline: 0,
              }}
            >
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography id="language-selection-title" variant="h5" component="h2">
                  Выбор языков
                </Typography>
                <Typography id="language-selection-description" color="text.secondary" sx={{ mt: 0.5 }}>
                  Выберите {languageChoiceCount} язык(а) для предыстории «{selectedBackground.name}».
                  Выбрано: {selectedBackgroundLanguages.length} из {languageChoiceCount}.
                </Typography>
              </Box>
              <Box sx={{ p: 3, overflowY: 'auto' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2,
                }}
              >
                {languages.map((language) => {
                  const isSelected = selectedBackgroundLanguages.includes(language.name);
                  const isDisabled = !isSelected
                    && selectedBackgroundLanguages.length >= languageChoiceCount;

                  return (
                    <Card
                      key={language._id}
                      variant="outlined"
                      sx={{
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                        opacity: isDisabled ? 0.6 : 1,
                      }}
                    >
                      <ButtonBase
                        component="button"
                        disabled={isDisabled}
                        onClick={() => handleLanguageToggle(language)}
                        aria-pressed={isSelected}
                        sx={{ display: 'block', width: '100%', textAlign: 'left' }}
                      >
                        <CardContent sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox checked={isSelected} tabIndex={-1} />
                            <Typography variant="h6" component="h3">
                              {language.name}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, whiteSpace: 'pre-line' }}
                          >
                            {language.description || 'Описание отсутствует.'}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                            {language.typical_speakers && (
                              <Chip size="small" label={`Носители: ${language.typical_speakers}`} />
                            )}
                            {language.script && (
                              <Chip size="small" label={`Письменность: ${language.script}`} />
                            )}
                            {language.rarity && (
                              <Chip size="small" label={`Редкость: ${language.rarity}`} />
                            )}
                          </Box>
                        </CardContent>
                      </ButtonBase>
                    </Card>
                  );
                })}
              </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                  px: 3,
                  py: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Button variant="outlined" onClick={() => setIsLanguageDialogOpen(false)}>
                  Назад
                </Button>
                <Button variant="contained" onClick={() => setIsLanguageDialogOpen(false)}>
                  Готово
                </Button>
              </Box>
            </Box>
          </Modal>
        </Paper>
      )}
    </Box>
  );
};
