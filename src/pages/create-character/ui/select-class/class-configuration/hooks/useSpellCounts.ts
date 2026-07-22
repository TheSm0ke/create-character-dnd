import { useMemo } from 'react';
import type { Class } from '../../../../../../api';

export const useSpellCounts = (classData: Class) => {
  const { levels, spellcasting } = classData;
  const firstLevel = levels.find((l) => l.level === 1);

  const cantripsToChoose = useMemo(() => {
    if (firstLevel?.cantrips_known) return firstLevel.cantrips_known;
    if (spellcasting?.cantrips_known_progression?.length) {
      return spellcasting.cantrips_known_progression[0];
    }
    return 0;
  }, [firstLevel, spellcasting]);

  const spells1ToChoose = useMemo(() => {
    if (firstLevel?.spells_known) return firstLevel.spells_known;
    if (spellcasting?.spells_known_progression?.length) {
      return spellcasting.spells_known_progression[0];
    }
    if (spellcasting?.spells_known_note) {
      const match = spellcasting.spells_known_note.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 0;
  }, [firstLevel, spellcasting]);

  return { cantripsToChoose, spells1ToChoose };
};