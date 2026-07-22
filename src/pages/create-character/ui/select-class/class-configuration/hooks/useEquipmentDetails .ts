// src/pages/create-character/ui/select-class/class-configuration/hooks/useEquipmentDetails.ts
import { useState, useEffect } from 'react';
import { searchWeapons, type Weapon } from '../../../../../../api';
import { searchArmors, type Armor } from '../../../../../../api';
import { searchItems, type Item } from '../../../../../../api';
import { searchTools, type Tool } from '../../../../../../api';

export type EquipmentType = 'weapon' | 'armor' | 'item' | 'tool' | 'unknown';

export interface EquipmentDetails {
  type: EquipmentType;
  data: Weapon | Armor | Item | Tool | null;
}

export const useEquipmentDetails = (itemName: string) => {
  const [details, setDetails] = useState<EquipmentDetails>({ type: 'unknown', data: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetails({ type: 'unknown', data: null });
       
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const [weapons, armors, items, tools] = await Promise.all([
          searchWeapons({ name: itemName }),
          searchArmors({ name: itemName }),
          searchItems({ name: itemName }),
          searchTools({ name: itemName }),
        ]);

        const normalized = itemName.toLowerCase().trim();

        const weapon = weapons.find(w => w.name.toLowerCase().trim() === normalized);
        if (weapon) {
          setDetails({ type: 'weapon', data: weapon });
          setLoading(false);
          return;
        }

        const armor = armors.find(a => a.name.toLowerCase().trim() === normalized);
        if (armor) {
          setDetails({ type: 'armor', data: armor });
          setLoading(false);
          return;
        }

        const tool = tools.find(t => t.name.toLowerCase().trim() === normalized);
        if (tool) {
          setDetails({ type: 'tool', data: tool });
          setLoading(false);
          return;
        }

        const item = items.find(i => i.name.toLowerCase().trim() === normalized);
        if (item) {
          setDetails({ type: 'item', data: item });
          setLoading(false);
          return;
        }

        setDetails({ type: 'unknown', data: null });
        setError('Предмет не найден в базе');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        setDetails({ type: 'unknown', data: null });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [itemName]);

  return { details, loading, error };
};