import { Box, Typography, useTheme, Button } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState, useCallback } from 'react';
import { fetchSpellsByClassAndLevel, type Class, type Spell } from '../../../../../api';
import { useFetch } from '../../../../../api/useFetch';
import { SelectSkills } from '../selectedSkills';
import { damageIcons, recommendedSpells } from './constants';
import { useSpellCounts } from './hooks/useSpellCounts';
import { useSpellFilter } from './hooks/useSpellFilter';
import { InstrumentsSelection } from './instrumentsSelection';
import { SubclassSelection } from './subclassSelection';
import { SpellSelection } from './spellSelection';
import { EquipmentOptionCard } from './equipmentOptionCard';

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
  const [selectedEquipment, setSelectedEquipment] = useState<{ [key: number]: number }>(() => {
    const initial: { [key: number]: number } = {};
    choices.forEach((choice, index) => {
      if (choice.options.length === 1) initial[index] = 0;
    });
    return initial;
  });
  const [selectedSubclass, setSelectedSubclass] = useState<string>(
    subclasses.length > 0 ? subclasses[0].id : ''
  );
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<Spell[]>([]);
  const [selectedSpells1, setSelectedSpells1] = useState<Spell[]>([]);

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

  const handleEquipmentChange = (choiceIndex: number, optionIndex: number) => {
    setSelectedEquipment(prev => ({ ...prev, [choiceIndex]: optionIndex }));
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
      if (choices[i].options.length > 1 && selectedEquipment[i] === undefined) return false;
    }
    if (subclasses.length > 0 && !selectedSubclass) return false;
    if (instrumentCount > 0 && selectedInstruments.length < instrumentCount) return false;
    if (cantripsToChoose > 0 && selectedCantrips.length < cantripsToChoose) return false;
    if (spells1ToChoose > 0 && selectedSpells1.length < spells1ToChoose) return false;
    return true;
  };

  const handleConfirm = () => {
    const equipment = choices.map((choice, idx) => {
      const selectedIdx = selectedEquipment[idx];
      if (selectedIdx === undefined) return [];
      return choice.options[selectedIdx].map(item => item.name);
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
                selected={selectedEquipment[idx] === optIdx}
                onToggle={() => handleEquipmentChange(idx, optIdx)}
                disabled={false}
              />
            </Box>
          ))}
        </Box>
      </Box>
    ))}

      <SubclassSelection
        subclasses={subclasses}
        selected={selectedSubclass}
        onChange={handleSubclassChange}
      />

      <InstrumentsSelection
        count={instrumentCount}
        selected={selectedInstruments}
        onChange={handleInstrumentChange}
      />

      {spellcasting && cantripsToChoose > 0 && (
        <SpellSelection
          title="Выберите заговоры"
          filteredSpells={cantripFilter.filteredSpells}
          selectedSpells={selectedCantrips}
          onToggle={handleCantripToggle}
          maxToChoose={cantripsToChoose}
          loading={loading}
          damageTypes={cantripFilter.damageTypes}
          damageFilter={cantripFilter.damageFilter}
          onDamageFilterChange={cantripFilter.setDamageFilter}
          searchQuery={cantripFilter.searchQuery}
          onSearchChange={cantripFilter.setSearchQuery}
          damageIcons={damageIcons}
          recommendedNames={recommendedSpells[name]?.cantrips}
          onApplyRecommended={applyRecommendedCantrips}
          onClear={clearCantrips}
        />
      )}

      {spellcasting && spells1ToChoose > 0 && (
        <SpellSelection
          title="Выберите заклинания 1-го уровня"
          filteredSpells={spell1Filter.filteredSpells}
          selectedSpells={selectedSpells1}
          onToggle={handleSpell1Toggle}
          maxToChoose={spells1ToChoose}
          loading={loading}
          damageTypes={spell1Filter.damageTypes}
          damageFilter={spell1Filter.damageFilter}
          onDamageFilterChange={spell1Filter.setDamageFilter}
          searchQuery={spell1Filter.searchQuery}
          onSearchChange={spell1Filter.setSearchQuery}
          damageIcons={damageIcons}
          recommendedNames={recommendedSpells[name]?.spells1}
          onApplyRecommended={applyRecommendedSpells1}
          onClear={clearSpells1}
        />
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