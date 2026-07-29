import { useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, TextField, Typography, useMediaQuery } from '@mui/material';
import type { Class } from '../../../../api';
import { getClassBackgroundImage } from '../../../../assets/class-icons';
import { ClassHeading } from './ClassHeading';
import { hasSpellcasting } from './spellcastingUtils';

const getShortDescription = (description: string) => {
  const normalizedDescription = description.replace(/\s+/g, ' ').trim();
  const maxLength = 170;

  if (normalizedDescription.length <= maxLength) return normalizedDescription;
  return `${normalizedDescription.slice(0, maxLength).trimEnd()}…`;
};

const ClassCard = ({
  classData,
  selected,
  onSelect,
}: {
  classData: Class;
  selected: boolean;
  onSelect: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hover, setHover] = useState(false);
  const {
    name,
    description,
    hit_dice,
    primary_ability,
    proficiencies,
    spellcasting,
  } = classData;
  const backgroundImage = getClassBackgroundImage(name);
  const isSpellcaster = hasSpellcasting(spellcasting);
  const proficiencyItems = [
    ...proficiencies.armor,
    ...proficiencies.weapons,
    ...proficiencies.tools,
  ];

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
        minHeight: 280,
        p: isMobile ? 2 : 2.25,
        border: '2px solid',
        borderColor: selected
          ? 'primary.main'
          : hover
            ? 'primary.light'
            : 'divider',
        borderRadius: 2,
        backgroundColor: selected
          ? alpha(theme.palette.primary.main, 0.12)
          : hover
            ? alpha(theme.palette.text.primary, 0.03)
            : 'background.paper',
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}`
          : 'none',
        transform: selected ? 'translateY(-2px)' : 'none',
        transition: theme.transitions.create([
          'border-color',
          'background-color',
          'box-shadow',
          'transform',
        ]),
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        '&::before': backgroundImage
          ? {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              backgroundImage: `url("${backgroundImage}")`,
              backgroundPosition: 'right 12px top 12px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'min(38%, 116px)',
              opacity: selected ? 0.28 : hover ? 0.22 : 0.14,
              pointerEvents: 'none',
            }
          : undefined,
      }}
    >
      <Box sx={{ mb: 1.5, pr: backgroundImage ? { xs: 0, sm: 8 } : 0 }}>
        <ClassHeading
          title={name}
          description={getShortDescription(description)}
          isSpellcaster={isSpellcaster}
          isMobile={isMobile}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.25,
          mb: 1.5,
        }}
      >
        <Box>
          <Typography variant="caption" color="primary.main">Кость HP</Typography>
          <Typography variant="body2">{hit_dice}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="primary.main">Осн. хар-ка</Typography>
          <Typography variant="body2">{primary_ability}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="primary.main">Спасброски</Typography>
          <Typography variant="body2">{proficiencies.saving_throws.join(', ') || '—'}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="primary.main">Навыки</Typography>
          <Typography variant="body2">
            {proficiencies.skills.number_to_choose} из {proficiencies.skills.list.length}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="caption" color="primary.main">Владения</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {proficiencyItems.length > 0 ? (
            proficiencyItems.map((item, index) => (
              <Chip
                key={`${item}-${index}`}
                label={item}
                size="small"
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">Нет</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

interface ClassListProps {
  classes: Class[];
  selectedClass: Class | null;
  onSelect: (cls: Class) => void;
}

export const ClassList = ({ classes, selectedClass, onSelect }: ClassListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase('ru-RU');
  const filteredClasses = classes.filter((classData) => (
    classData.name.toLocaleLowerCase('ru-RU').includes(normalizedSearchQuery)
  ));

  return (
    <Box sx={{ p: isMobile ? 1 : 2, width: '100%', boxSizing: 'border-box' }}>
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        sx={{ color: 'text.primary', mb: isMobile ? 2 : 3 }}
      >
        Выбор класса
      </Typography>
      <TextField
        fullWidth
        label="Поиск класса"
        placeholder="Введите название класса"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        sx={{ mb: 2.5 }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          columnGap: 2.5,
          rowGap: 4,
          alignItems: 'stretch',
        }}
      >
        {filteredClasses.map((classData) => (
          <ClassCard
            key={classData._id}
            classData={classData}
            selected={selectedClass?._id === classData._id}
            onSelect={() => onSelect(classData)}
          />
        ))}
      </Box>
      {filteredClasses.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Классы с таким названием не найдены.
        </Typography>
      )}
    </Box>
  );
};
