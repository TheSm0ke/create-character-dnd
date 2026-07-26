/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, useTheme, Button } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState, useCallback } from 'react';
import { fetchSpellsByClassAndLevel, type Class, type Spell } from '../../../../../api';
import { useFetch } from '../../../../../api/useFetch';
import { SelectSkills } from '../selectedSkills';
import { useSpellCounts } from './hooks/useSpellCounts';
import { useSpellFilter } from './hooks/useSpellFilter';
import { useEquipmentSelection } from './hooks/useEquipmentSelection';
import { EquipmentChoices } from './ui/EquipmentChoices';
import { SpellSelection } from './ui/SpellSelection';
import { FixedEquipmentDisplay } from './ui/FixedEquipmentDisplay';
import { SubclassSelection } from './ui/SubclassSelection';
import { InstrumentSelection } from './ui/InstrumentSelection';
import { recommendedSpells } from './constants';

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
  const [selectedSubclass, setSelectedSubclass] = useState<string>(
    subclasses.length > 0 ? subclasses[0].id : ''
  );
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedCantrips, setSelectedCantrips] = useState<Spell[]>([]);
  const [selectedSpells1, setSelectedSpells1] = useState<Spell[]>([]);

  const {
    selectedEquipment,
    loadedItems,
    itemSearchQueries,
    setItemSearchQuery,
    filterWeaponItems,
    filterItems,
    handleEquipmentOptionSelect,
    handleSpecificItemSelect,
    handleRemoveSpecificItem,
  } = useEquipmentSelection(choices);

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
      const data = loadedItems[key];
      if (!data) return false;

      if (data.isShieldOption) {
        const weaponItems = data.weaponItems || [];
        if (weaponItems.length > 1 && selection.specificItemIds.length === 0) return false;
        continue;
      }

      if (data.isMultiSelect) {
        const maxSelect = data.maxSelect || 1;
        if (selection.specificItemIds.length < maxSelect) return false;
        continue;
      }

      const items = data.items || [];
      const isPack = data.isPack;
      if (isPack) continue;

      if (items.length === 1 && !data.isMultiSelect && !data.isShieldOption) {
        if (selection.specificItemIds.length === 0) return false;
        continue;
      }
      if (items.length > 1 && selection.specificItemIds.length === 0) return false;
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
      const data = loadedItems[key];
      if (!data) return [];

      if (data.isShieldOption) {
        const weaponItems = data.weaponItems || [];
        const shieldItem = data.shieldItem;
        const chosenWeapon = weaponItems.find((item: any) => item._id === selection.specificItemIds[0]);
        const result = [];
        if (chosenWeapon) result.push(chosenWeapon.name);
        if (shieldItem) result.push(shieldItem.name);
        return result;
      }

      if (data.isMultiSelect) {
        const items = data.items || [];
        const selectedItems = items.filter((item: any) => selection.specificItemIds.includes(item._id));
        return selectedItems.map((item: any) => item.name);
      }

      const items = data.items || [];
      const isPack = data.isPack;
      if (isPack || items.length > 1) {
        return items.map((item: any) => item.name);
      } else {
        const found = items.find((item: any) => item._id === selection.specificItemIds[0]);
        if (found) return [found.name];
        if (items.length > 0) return [items[0].name];
        const option = choice.options[selection.optionIndex];
        return option.map((item: any) => item.name);
      }
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

      <FixedEquipmentDisplay fixedEquipment={fixed_equipment} />

      <EquipmentChoices
        choices={choices}
        selectedEquipment={selectedEquipment}
        loadedItems={loadedItems}
        itemSearchQueries={itemSearchQueries}
        setItemSearchQuery={setItemSearchQuery}
        filterWeaponItems={filterWeaponItems}
        filterItems={filterItems}
        handleEquipmentOptionSelect={handleEquipmentOptionSelect}
        handleSpecificItemSelect={handleSpecificItemSelect}
        handleRemoveSpecificItem={handleRemoveSpecificItem}
      />

      <SubclassSelection subclasses={subclasses} selectedSubclass={selectedSubclass} onChange={handleSubclassChange} />

      <InstrumentSelection instrumentCount={instrumentCount} selectedInstruments={selectedInstruments} onChange={handleInstrumentChange} />

      {spellcasting && cantripsToChoose > 0 && (
        <SpellSelection
          title="Выберите заговоры"
          spells={cantripFilter.filteredSpells}
          selectedSpells={selectedCantrips}
          onToggle={handleCantripToggle}
          toChoose={cantripsToChoose}
          searchQuery={cantripFilter.searchQuery}
          setSearchQuery={cantripFilter.setSearchQuery}
          damageFilter={cantripFilter.damageFilter}
          setDamageFilter={cantripFilter.setDamageFilter}
          damageTypes={cantripFilter.damageTypes}
          applyRecommended={applyRecommendedCantrips}
          clear={clearCantrips}
          loading={loading}
          className={name}
          isCantrip={true}
        />
      )}

      {spellcasting && spells1ToChoose > 0 && (
        <SpellSelection
          title="Выберите заклинания 1-го уровня"
          spells={spell1Filter.filteredSpells}
          selectedSpells={selectedSpells1}
          onToggle={handleSpell1Toggle}
          toChoose={spells1ToChoose}
          searchQuery={spell1Filter.searchQuery}
          setSearchQuery={spell1Filter.setSearchQuery}
          damageFilter={spell1Filter.damageFilter}
          setDamageFilter={spell1Filter.setDamageFilter}
          damageTypes={spell1Filter.damageTypes}
          applyRecommended={applyRecommendedSpells1}
          clear={clearSpells1}
          loading={loading}
          className={name}
          isCantrip={false}
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