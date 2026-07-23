// src/pages/create-character/ui/select-class/class-configuration/hooks/useEquipmentDetails.ts
import { useState, useEffect } from 'react';
import { fetchEquipmentDetails } from '../../../../../../api/equipment';
import type { Weapon, Armor, Item, Tool } from '../../../../../../api';
import type { EquipmentType } from '../../../../../../api/equipment';

export interface EquipmentDetails {
  type: EquipmentType;
  data: Weapon | Armor | Item | Tool | null;
}

export const useEquipmentDetails = (itemName: string) => {
  const [details, setDetails] = useState<EquipmentDetails>({ type: 'item', data: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetails({ type: 'item', data: null });
       
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchEquipmentDetails(itemName);
        if (result) {
          setDetails(result);
        } else {
          setDetails({ type: 'item', data: null });
          setError('Предмет не найден');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        setDetails({ type: 'item', data: null });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [itemName]);

  return { details, loading, error };
};