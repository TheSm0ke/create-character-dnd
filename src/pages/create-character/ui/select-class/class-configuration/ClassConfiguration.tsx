import { Box, Typography, useTheme, Button, Chip, OutlinedInput, InputAdornment, Select, MenuItem, FormControl, Checkbox } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState, useCallback } from 'react';
import { fetchSpellsByClassAndLevel, type Class, type Spell, searchEquipment } from '../../../../../api';
import { useFetch } from '../../../../../api/useFetch';
import { SelectSkills } from '../selectedSkills';
import { damageIcons, recommendedSpells, INSTRUMENTS } from './constants';
import { useSpellCounts } from './hooks/useSpellCounts';
import { useSpellFilter } from './hooks/useSpellFilter';
import { EquipmentItemCard } from './EquipmentItemCard';
import { getItemType } from './utils/equipmentUtils';
import { SpellCard } from '../spellCard';
import type { Weapon, Armor, Item, Tool } from '../../../../../api';

const searchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

interface ClassConfigurationProps {
  classData: Class;
  onConfirm: (config: {
    skills: string[];
    equipment: string[][];
    subclass?: string;
    instruments?: string[];
    cantrips: Spell[];
    spells1: Spell[];
  }) => void;
  onBack: () => void;
}

const filterChipSx = {
  color: 'white',
  padding: '8px 16px',
  height: 'auto',
  fontSize: '0.9rem',
  '& .MuiChip-label': { padding: '4px 12px' },
  '& .MuiChip-icon': { width: 24, height: 24 },
};

export const ClassConfiguration = ({ classData, onConfirm, onBack }: ClassConfigurationProps) => {
  const theme = useTheme();
  const { proficiencies, subclasses, spellcasting, name, fixed_equipment, choices } = classData;

  const { cantripsToChoose, spells1ToChoose } = useSpellCounts(classData);

  const fetchSpellsData = useCallback(async () => {
    if (!spellcasting || (cantripsToChoose === 0 && spells1ToChoose === 0)) {
      return { cantrips: [] as Spell[], spells1: [] as Spell[] };
    }
    const className = name.toLowerCase();
    const [cantrips, spells1] = await Promise.all([
      fetchSpellsByClassAndLevel(className, 'Заговор'),
      fetchSpellsByClassAndLevel(className, 1),
    ]);
    return { cantrips, spells1 };
  }, [name, spellcasting, cantripsToChoose, spells1ToChoose]);

  const { data: spellsData, loading, error } = useFetch(fetchSpellsData);

  const cantripFilter = useSpellFilter(spellsData?.cantrips);
  const spell1Filter = useSpellFilter(spellsData?.spells1);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSubclass, setSelectedSubclass] = useState<string>(
    subclasses.length > 0 ? subclasses[0].id : ''
  );
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<Spell[]>([]);
  const [selectedSpells1, setSelectedSpells1] = useState<Spell[]>([]);

  const [selectedEquipment, setSelectedEquipment] = useState<{
    [key: number]: { optionIndex: number; specificItemId?: string }
  }>(() => {
    const initial: { [key: number]: { optionIndex: number; specificItemId?: string } } = {};
    choices.forEach((choice, index) => {
      if (choice.options.length === 1) {
        initial[index] = { optionIndex: 0 };
      }
    });
    return initial;
  });

  const [loadedItems, setLoadedItems] = useState<{
    [key: string]: (Weapon | Armor | Item | Tool)[]
  }>({});

  const [itemSearchQueries, setItemSearchQueries] = useState<{ [key: number]: string }>({});

  const setItemSearchQuery = (idx: number, query: string) => {
    setItemSearchQueries(prev => ({ ...prev, [idx]: query }));
  };

  const filterItems = useCallback((choiceIndex: number) => {
    const selection = selectedEquipment[choiceIndex];
    if (!selection) return [];
    const key = `${choiceIndex}-${selection.optionIndex}`;
    const items = loadedItems[key] || [];
    const query = itemSearchQueries[choiceIndex] || '';
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(q));
  }, [selectedEquipment, loadedItems, itemSearchQueries]);

  const hasInstrumentChoice = proficiencies.tools.some((tool) =>
    tool.toLowerCase().includes('музыкальный инструмент')
  );
  const instrumentCount = (() => {
    if (!hasInstrumentChoice) return 0;
    const toolStr = proficiencies.tools.find((t) =>
      t.toLowerCase().includes('музыкальный инструмент')
    );
    if (!toolStr) return 0;
    const match = toolStr.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  })();

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    );
  };

  const handleSubclassChange = (event: SelectChangeEvent) => {
    setSelectedSubclass(event.target.value);
  };

  const handleInstrumentChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedInstruments(typeof value === 'string' ? value.split(',') : value);
  };

  const handleCantripToggle = useCallback((spell: Spell) => {
    setSelectedCantrips(prev => {
      if (prev.some(s => s._id === spell._id)) return prev.filter(s => s._id !== spell._id);
      if (prev.length >= cantripsToChoose) return prev;
      return [...prev, spell];
    });
  }, [cantripsToChoose]);

  const handleSpell1Toggle = useCallback((spell: Spell) => {
    setSelectedSpells1(prev => {
      if (prev.some(s => s._id === spell._id)) return prev.filter(s => s._id !== spell._id);
      if (prev.length >= spells1ToChoose) return prev;
      return [...prev, spell];
    });
  }, [spells1ToChoose]);

  const loadItemsForOption = useCallback(async (choiceIndex: number, optionIndex: number) => {
    const key = `${choiceIndex}-${optionIndex}`;
    if (loadedItems[key]) return;
    const choice = choices[choiceIndex];
    const optionName = choice.options[optionIndex][0]?.name;
    if (!optionName) return;
    try {
      const results = await searchEquipment(optionName);
      setLoadedItems(prev => ({ ...prev, [key]: results }));
      if (results.length === 1) {
        setSelectedEquipment(prev => ({
          ...prev,
          [choiceIndex]: {
            ...prev[choiceIndex],
            specificItemId: results[0]._id,
          }
        }));
      }
    } catch (e) {
      console.error('Ошибка загрузки предметов:', e);
    }
  }, [choices, loadedItems]);

  const handleEquipmentOptionSelect = useCallback((choiceIndex: number, optionIndex: number) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [choiceIndex]: { optionIndex, specificItemId: undefined }
    }));
    loadItemsForOption(choiceIndex, optionIndex);
  }, [loadItemsForOption]);

  const handleSpecificItemSelect = useCallback((choiceIndex: number, itemId: string) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [choiceIndex]: {
        ...prev[choiceIndex],
        specificItemId: itemId,
      }
    }));
  }, []);

  const getSelectedItemName = useCallback((choiceIndex: number) => {
    const selection = selectedEquipment[choiceIndex];
    if (!selection) return null;
    const key = `${choiceIndex}-${selection.optionIndex}`;
    const items = loadedItems[key] || [];
    const found = items.find(item => item._id === selection.specificItemId);
    return found?.name || null;
  }, [selectedEquipment, loadedItems]);

  const applyRecommendedCantrips = useCallback(() => {
    const names = recommendedSpells[name]?.cantrips || [];
    const spells = spellsData?.cantrips?.filter(s => names.includes(s.name)) || [];
    setSelectedCantrips(spells.slice(0, cantripsToChoose));
  }, [name, spellsData?.cantrips, cantripsToChoose]);

  const applyRecommendedSpells1 = useCallback(() => {
    const names = recommendedSpells[name]?.spells1 || [];
    const spells = spellsData?.spells1?.filter(s => names.includes(s.name)) || [];
    setSelectedSpells1(spells.slice(0, spells1ToChoose));
  }, [name, spellsData?.spells1, spells1ToChoose]);

  const clearCantrips = useCallback(() => setSelectedCantrips([]), []);
  const clearSpells1 = useCallback(() => setSelectedSpells1([]), []);

  const allSelected = () => {
    if (loading) return false;
    const skillsToChoose = proficiencies.skills.number_to_choose;
    if (skillsToChoose > 0 && selectedSkills.length < skillsToChoose) return false;

    for (let i = 0; i < choices.length; i++) {
      const selection = selectedEquipment[i];
      if (!selection) return false;
      const key = `${i}-${selection.optionIndex}`;
      const items = loadedItems[key];
      if (items && items.length > 1 && !selection.specificItemId) return false;
    }

    if (subclasses.length > 0 && !selectedSubclass) return false;
    if (instrumentCount > 0 && selectedInstruments.length < instrumentCount) return false;
    if (cantripsToChoose > 0 && selectedCantrips.length < cantripsToChoose) return false;
    if (spells1ToChoose > 0 && selectedSpells1.length < spells1ToChoose) return false;
    return true;
  };

  const handleConfirm = () => {
    const equipment = choices.map((choice, idx) => {
      const selection = selectedEquipment[idx];
      if (!selection) return [];
      const key = `${idx}-${selection.optionIndex}`;
      const items = loadedItems[key] || [];
      const found = items.find(item => item._id === selection.specificItemId);
      if (found) return [found.name];
      const option = choice.options[selection.optionIndex];
      return option.map(item => item.name);
    });
    onConfirm({
      skills: selectedSkills,
      equipment,
      subclass: subclasses.length > 0 ? selectedSubclass : undefined,
      instruments: instrumentCount > 0 ? selectedInstruments : undefined,
      cantrips: selectedCantrips,
      spells1: selectedSpells1,
    });
  };

  return (
    <Box sx={{ p: 2, maxWidth: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
        Настройка класса: {name}
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>Ошибка: {error}</Typography>}

      {proficiencies.skills.number_to_choose > 0 && (
        <SelectSkills
          proficiencies={proficiencies}
          selectedSkills={selectedSkills}
          onSkillToggle={handleSkillToggle}
        />
      )}

      {fixed_equipment.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Вы получаете:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            {fixed_equipment.map((item, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: theme.palette.common.white, mr: 1 }}>
                • {item.name} {item.count > 1 && `(×${item.count})`}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {choices.map((choice, idx) => {
        const selection = selectedEquipment[idx];
        const selectedOptionIndex = selection?.optionIndex;
        const selectedOption = selectedOptionIndex !== undefined ? choice.options[selectedOptionIndex] : null;
        const selectedOptionName = selectedOption?.[0]?.name || '';

        const key = `${idx}-${selectedOptionIndex}`;
        const items = loadedItems[key];
        const hasItems = items && items.length > 0;
        const showSelection = hasItems && items.length > 1;

        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
              {choice.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
              {choice.options.map((option, optIdx) => {
                const isSelected = selectedOptionIndex === optIdx;
                const label = option.map(item => `${item.name} ${item.count > 1 ? `(×${item.count})` : ''}`).join(', ');
                return (
                  <Box
                    key={optIdx}
                    onClick={() => handleEquipmentOptionSelect(idx, optIdx)}
                    sx={{
                      padding: '12px 16px',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: isSelected
                        ? theme.palette.primary.main
                        : 'rgba(255,255,255,0.08)',
                      backgroundColor: isSelected
                        ? 'rgba(170, 59, 255, 0.12)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: isSelected
                          ? theme.palette.primary.main
                          : theme.palette.primary.light,
                        backgroundColor: isSelected
                          ? 'rgba(170, 59, 255, 0.12)'
                          : 'rgba(255,255,255,0.03)',
                      },
                      width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isSelected && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" fill={theme.palette.primary.main} />
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
                        </svg>
                      )}
                      <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
                        {label}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {showSelection && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
                  Выберите конкретный предмет:
                </Typography>
                <OutlinedInput
                  placeholder="Поиск по названию..."
                  value={itemSearchQueries[idx] || ''}
                  onChange={(e) => setItemSearchQuery(idx, e.target.value)}
                  size="small"
                  startAdornment={
                    <InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>
                      {searchIcon}
                    </InputAdornment>
                  }
                  sx={{
                    mt: 1,
                    width: '100%',
                    color: theme.palette.common.white,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                  }}
                />
                {/* Здесь карточки предметов теперь в сетке (горизонтально) */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1, mt: 1 }}>
                  {filterItems(idx).map((item, itemIdx) => {
                    const type = getItemType(item);
                    const isSelected = selection?.specificItemId === item._id;
                    return (
                      <EquipmentItemCard
                        key={itemIdx}
                        item={item}
                        type={type}
                        selected={isSelected}
                        onSelect={() => handleSpecificItemSelect(idx, item._id)}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {selectedOptionIndex !== undefined && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                Выбрано: {getSelectedItemName(idx) || selectedOptionName}
              </Typography>
            )}
          </Box>
        );
      })}

      {subclasses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Выберите подкласс
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              value={selectedSubclass}
              onChange={handleSubclassChange}
              sx={{
                color: theme.palette.common.white,
                '& .MuiSelect-icon': { color: theme.palette.common.white },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              }}
            >
              {subclasses.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  <Box>
                    <Typography variant="body1">{sub.name}</Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {sub.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {hasInstrumentChoice && instrumentCount > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
            Выберите {instrumentCount} музыкальных инструмента
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <Select
              multiple
              value={selectedInstruments}
              onChange={handleInstrumentChange}
              input={<OutlinedInput sx={{ color: theme.palette.common.white }} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} sx={{ color: 'white' }} />
                  ))}
                </Box>
              )}
              sx={{
                color: theme.palette.common.white,
                '& .MuiSelect-icon': { color: theme.palette.common.white },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              }}
            >
              {INSTRUMENTS.map((inst) => (
                <MenuItem key={inst} value={inst}>
                  <Checkbox checked={selectedInstruments.indexOf(inst) > -1} />
                  <Typography sx={{ color: theme.palette.common.white }}>{inst}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Заговоры */}
      {spellcasting && cantripsToChoose > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
              Выберите заговоры ({selectedCantrips.length}/{cantripsToChoose})
              <span style={{ color: theme.palette.text.secondary, marginLeft: 8, fontSize: '0.9rem' }}>
                {selectedCantrips.length > 0 ? `– ${selectedCantrips.map(s => s.name).join(', ')}` : ''}
              </span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!loading && spellsData?.cantrips && spellsData.cantrips.length > 0 && (
                <>
                  <Button size="small" variant="outlined" onClick={applyRecommendedCantrips} disabled={selectedCantrips.length === cantripsToChoose} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Рекомендованные</Button>
                  <Button size="small" variant="outlined" onClick={clearCantrips} disabled={selectedCantrips.length === 0} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Очистить</Button>
                </>
              )}
            </Box>
          </Box>

          <OutlinedInput
            placeholder="Поиск заговоров..."
            value={cantripFilter.searchQuery}
            onChange={(e) => cantripFilter.setSearchQuery(e.target.value)}
            size="small"
            startAdornment={<InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>{searchIcon}</InputAdornment>}
            sx={{ mb: 1, width: '100%', maxWidth: 400, color: theme.palette.common.white, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main } }}
          />

          {!loading && cantripFilter.damageTypes.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              <Chip label="Все" size="medium" onClick={() => cantripFilter.setDamageFilter(null)} color={cantripFilter.damageFilter === null ? 'primary' : 'default'} variant={cantripFilter.damageFilter === null ? 'filled' : 'outlined'} sx={filterChipSx} />
              {cantripFilter.damageTypes.map((type) => {
                const icon = damageIcons[type];
                return (
                  <Chip key={type} label={type} size="medium" onClick={() => cantripFilter.setDamageFilter(cantripFilter.damageFilter === type ? null : type)} color={cantripFilter.damageFilter === type ? 'primary' : 'default'} variant={cantripFilter.damageFilter === type ? 'filled' : 'outlined'} icon={icon ? <img src={icon} alt={type} width={24} height={24} style={{ display: 'block' }} /> : undefined} sx={filterChipSx} />
                );
              })}
            </Box>
          )}

          {loading ? (
            <Typography sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>
          ) : (
            <Box sx={{ maxHeight: 600, overflowY: 'auto', paddingRight: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)', borderRadius: 4 }, '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: 4 } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))', gap: 1.5 }}>
                {cantripFilter.filteredSpells.length > 0 ? (
                  cantripFilter.filteredSpells.map((spell) => (
                    <SpellCard key={spell._id} spell={spell} selected={selectedCantrips.some(s => s._id === spell._id)} onToggle={() => handleCantripToggle(spell)} disabled={!selectedCantrips.some(s => s._id === spell._id) && selectedCantrips.length >= cantripsToChoose} recommended={recommendedSpells[name]?.cantrips?.includes(spell.name) ?? false} />
                  ))
                ) : (
                  <Typography sx={{ color: theme.palette.text.secondary }}>Нет заговоров с выбранным типом урона или по запросу</Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Заклинания 1-го уровня */}
      {spellcasting && spells1ToChoose > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
              Выберите заклинания 1-го уровня ({selectedSpells1.length}/{spells1ToChoose})
              <span style={{ color: theme.palette.text.secondary, marginLeft: 8, fontSize: '0.9rem' }}>
                {selectedSpells1.length > 0 ? `– ${selectedSpells1.map(s => s.name).join(', ')}` : ''}
              </span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!loading && spellsData?.spells1 && spellsData.spells1.length > 0 && (
                <>
                  <Button size="small" variant="outlined" onClick={applyRecommendedSpells1} disabled={selectedSpells1.length === spells1ToChoose} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Рекомендованные</Button>
                  <Button size="small" variant="outlined" onClick={clearSpells1} disabled={selectedSpells1.length === 0} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Очистить</Button>
                </>
              )}
            </Box>
          </Box>

          <OutlinedInput
            placeholder="Поиск заклинаний 1-го уровня..."
            value={spell1Filter.searchQuery}
            onChange={(e) => spell1Filter.setSearchQuery(e.target.value)}
            size="small"
            startAdornment={<InputAdornment position="start" sx={{ color: theme.palette.text.secondary }}>{searchIcon}</InputAdornment>}
            sx={{ mb: 1, width: '100%', maxWidth: 400, color: theme.palette.common.white, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main } }}
          />

          {!loading && spell1Filter.damageTypes.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              <Chip label="Все" size="medium" onClick={() => spell1Filter.setDamageFilter(null)} color={spell1Filter.damageFilter === null ? 'primary' : 'default'} variant={spell1Filter.damageFilter === null ? 'filled' : 'outlined'} sx={filterChipSx} />
              {spell1Filter.damageTypes.map((type) => {
                const icon = damageIcons[type];
                return (
                  <Chip key={type} label={type} size="medium" onClick={() => spell1Filter.setDamageFilter(spell1Filter.damageFilter === type ? null : type)} color={spell1Filter.damageFilter === type ? 'primary' : 'default'} variant={spell1Filter.damageFilter === type ? 'filled' : 'outlined'} icon={icon ? <img src={icon} alt={type} width={24} height={24} style={{ display: 'block' }} /> : undefined} sx={filterChipSx} />
                );
              })}
            </Box>
          )}

          {loading ? (
            <Typography sx={{ color: theme.palette.text.secondary }}>Загрузка...</Typography>
          ) : (
            <Box sx={{ maxHeight: 600, overflowY: 'auto', paddingRight: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)', borderRadius: 4 }, '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: 4 } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(570px, 1fr))', gap: 1.5 }}>
                {spell1Filter.filteredSpells.length > 0 ? (
                  spell1Filter.filteredSpells.map((spell) => (
                    <SpellCard key={spell._id} spell={spell} selected={selectedSpells1.some(s => s._id === spell._id)} onToggle={() => handleSpell1Toggle(spell)} disabled={!selectedSpells1.some(s => s._id === spell._id) && selectedSpells1.length >= spells1ToChoose} recommended={recommendedSpells[name]?.spells1?.includes(spell.name) ?? false} />
                  ))
                ) : (
                  <Typography sx={{ color: theme.palette.text.secondary }}>Нет заклинаний 1-го уровня с выбранным типом урона или по запросу</Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>Назад</Button>
        <Button variant="contained" color="primary" onClick={handleConfirm} disabled={!allSelected()}>
          Подтвердить
        </Button>
      </Box>
    </Box>
  );
};