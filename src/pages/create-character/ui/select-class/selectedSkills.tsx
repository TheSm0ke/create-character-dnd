import { memo, useState, useMemo } from 'react';
import { Box, Typography, useTheme, CircularProgress, OutlinedInput, InputAdornment } from '@mui/material';
import { useFetch } from '../../../../api/useFetch';
import { type Skill, fetchSkills } from '../../../../api';
import { searchIcon } from './class-configuration/constants';
import { useDebounce } from './class-configuration/hooks/useDebounce';
import { SkillCard } from './skillCard';

interface SelectSkillsProps {
  proficiencies: {
    skills: {
      number_to_choose: number;
      list: string[];
    };
  };
  selectedSkills: string[];
  onSkillToggle: (skillName: string) => void;
}

export const SelectSkills = memo(({ proficiencies, selectedSkills, onSkillToggle }: SelectSkillsProps) => {
  const theme = useTheme();
  const { data: allSkills, loading, error } = useFetch<Skill[]>(fetchSkills);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const availableSkills = useMemo(() => {
    if (!allSkills) return [];
    const filteredByName = allSkills.filter((skill) =>
      proficiencies.skills.list.includes(skill.name)
    );
    if (!debouncedSearch.trim()) return filteredByName;
    const query = debouncedSearch.trim().toLowerCase();
    return filteredByName.filter((skill) =>
      skill.name.toLowerCase().includes(query)
    );
  }, [allSkills, proficiencies.skills.list, debouncedSearch]);

  const selectedNames = selectedSkills.length > 0
    ? `– ${selectedSkills.join(', ')}`
    : '';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: theme.palette.error.main }}>
        Ошибка загрузки навыков: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, mb: 1.5 }}>
        Выберите навыки ({selectedSkills.length}/{proficiencies.skills.number_to_choose})
        <span style={{ color: theme.palette.text.secondary, marginLeft: 8, fontSize: '0.9rem' }}>
          {selectedNames}
        </span>
      </Typography>

      <OutlinedInput
        placeholder="Поиск навыков..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        startAdornment={
          <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
            {searchIcon}
          </InputAdornment>
        }
        sx={{
          mb: 2,
          width: '100%',
          maxWidth: 400,
          color: theme.palette.common.white,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
        }}
      />

      {availableSkills.length === 0 ? (
        <Typography sx={{ color: theme.palette.text.secondary }}>
          {searchQuery ? 'Навыки не найдены' : 'Нет доступных навыков для выбора.'}
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 500,
            overflowY: 'auto',
            paddingRight: 1,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.primary.light,
            },
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.name);
              const isDisabled =
                !isSelected && selectedSkills.length >= proficiencies.skills.number_to_choose;

              return (
                <Box
                  key={skill._id}
                  sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' } }}
                >
                  <SkillCard
                    skill={skill}
                    selected={isSelected}
                    onToggle={() => onSkillToggle(skill.name)}
                    disabled={isDisabled}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
});

SelectSkills.displayName = 'SelectSkills';