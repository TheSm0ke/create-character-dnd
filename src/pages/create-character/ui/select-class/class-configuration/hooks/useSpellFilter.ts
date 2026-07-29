import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { Spell } from '../../../../../../api';

export const useSpellFilter = (spells: Spell[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [damageFilter, setDamageFilter] = useState<string | null>(null);
  const [damageDiceFilter, setDamageDiceFilter] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredSpells = useMemo(() => {
    if (!spells) return [];
    let result = spells;
    if (damageFilter) {
      result = result.filter((s) => s.damage_type === damageFilter);
    }
    if (damageDiceFilter) {
      result = result.filter((s) => s.damage_dice === damageDiceFilter);
    }
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }
    return result;
  }, [spells, damageFilter, damageDiceFilter, debouncedSearch]);

  const damageTypes = useMemo(() => {
    if (!spells) return [];
    return Array.from(new Set(spells.map((s) => s.damage_type).filter(Boolean))).sort() as string[];
  }, [spells]);

  const damageDice = useMemo(() => {
    if (!spells) return [];
    return Array.from(new Set(spells.map((spell) => spell.damage_dice).filter(Boolean))).sort() as string[];
  }, [spells]);

  return {
    searchQuery,
    setSearchQuery,
    damageFilter,
    setDamageFilter,
    damageDiceFilter,
    setDamageDiceFilter,
    filteredSpells,
    damageTypes,
    damageDice,
  };
};
