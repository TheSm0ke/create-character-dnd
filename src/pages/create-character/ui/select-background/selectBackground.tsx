import { Autocomplete, Box, Paper, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
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
            onSelect={() => onSelectBackground(bg)}
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
          <Autocomplete
            multiple
            options={languages}
            value={selectedLanguageOptions}
            getOptionLabel={(language) => language.name}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            getOptionDisabled={(option) =>
              selectedBackgroundLanguages.length >= languageChoiceCount
              && !selectedBackgroundLanguages.includes(option.name)
            }
            onChange={(_, values) =>
              onSelectedBackgroundLanguagesChange(
                values.slice(0, languageChoiceCount).map((language) => language.name),
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Языки предыстории"
                helperText={`Выбрано ${selectedBackgroundLanguages.length} из ${languageChoiceCount}`}
              />
            )}
          />
        </Paper>
      )}
    </Box>
  );
};
