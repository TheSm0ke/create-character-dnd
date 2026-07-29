/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { searchEquipment } from '../../../../../../api';

export interface EquipmentChoice {
  description: string;
  options: { name: string; count: number }[][];
}

export interface SelectedEquipment {
  [key: number]: { optionIndex: number; specificItemIds: string[] };
}

export interface LoadedItemData {
  items: any[];
  isPack: boolean;
  weaponItems?: any[];
  shieldItem?: any | null;
  isShieldOption?: boolean;
  isMultiSelect?: boolean;
  maxSelect?: number;
  isComposite?: boolean;
  fixedCount?: number;
}

export function useEquipmentSelection(choices: EquipmentChoice[]) {
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment>(() => {
    const initial: SelectedEquipment = {};
    choices.forEach((choice, index) => {
      if (choice.options.length === 1) {
        initial[index] = { optionIndex: 0, specificItemIds: [] };
      }
    });
    return initial;
  });

  const [loadedItems, setLoadedItems] = useState<{ [key: string]: LoadedItemData }>({});
  const [itemSearchQueries, setItemSearchQueries] = useState<{ [key: number]: string }>({});

  const setItemSearchQuery = (idx: number, query: string) => {
    setItemSearchQueries(prev => ({ ...prev, [idx]: query }));
  };

  const filterWeaponItems = useCallback((choiceIndex: number) => {
    const selection = selectedEquipment[choiceIndex];
    if (!selection) return [];
    const key = `${choiceIndex}-${selection.optionIndex}`;
    const data = loadedItems[key];
    if (!data || !data.weaponItems) return [];
    const items = data.weaponItems;
    const query = itemSearchQueries[choiceIndex] || '';
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item: any) => item && item.name && item.name.toLowerCase().includes(q));
  }, [selectedEquipment, loadedItems, itemSearchQueries]);

  const filterItems = useCallback((choiceIndex: number) => {
    const selection = selectedEquipment[choiceIndex];
    if (!selection) return [];
    const key = `${choiceIndex}-${selection.optionIndex}`;
    const data = loadedItems[key];
    if (!data) return [];
    const items = data.items || [];
    const query = itemSearchQueries[choiceIndex] || '';
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item: any) => item && item.name && item.name.toLowerCase().includes(q));
  }, [selectedEquipment, loadedItems, itemSearchQueries]);

  const loadItemsForOption = useCallback(async (choiceIndex: number, optionIndex: number) => {
    const key = `${choiceIndex}-${optionIndex}`;
    if (loadedItems[key]) return;
    const choice = choices[choiceIndex];
    const option = choice.options[optionIndex];

    const totalCount = option.reduce((sum: number, item: any) => sum + (item.count || 1), 0);
    const isMultiSelect = option.length === 1 && totalCount > 1;
    const maxSelect = isMultiSelect ? totalCount : 0;

    const hasShield = option.some((item: any) => item.name && item.name.toLowerCase().includes('щит'));

    if (hasShield && option.length > 1) {
      const weaponName = option.find((item: any) => !item.name.toLowerCase().includes('щит'))?.name || '';
      const shieldName = option.find((item: any) => item.name.toLowerCase().includes('щит'))?.name || 'щит';
      try {
        const weaponResult = await searchEquipment(weaponName);
        let weaponItems: any[] = [];
        if (Array.isArray(weaponResult)) {
          weaponItems = weaponResult;
        } else if (weaponResult && typeof weaponResult === 'object' && 'items' in weaponResult) {
          weaponItems = (weaponResult as any).items || [];
        } else if (weaponResult && typeof weaponResult === 'object' && 'type' in weaponResult && 'data' in weaponResult) {
          const data = (weaponResult as any).data;
          if (Array.isArray(data)) weaponItems = data;
          else if (data && typeof data === 'object') {
            if ('items' in data) weaponItems = (data as any).items || [];
            else weaponItems = [data];
          }
        }

        const shieldResult = await searchEquipment(shieldName);
        let shieldItem: any = null;
        if (Array.isArray(shieldResult) && shieldResult.length > 0) shieldItem = shieldResult[0];
        else if (shieldResult && typeof shieldResult === 'object' && 'items' in shieldResult) {
          shieldItem = (shieldResult as any).items?.[0] || null;
        } else if (shieldResult && typeof shieldResult === 'object' && 'type' in shieldResult && 'data' in shieldResult) {
          const data = (shieldResult as any).data;
          if (Array.isArray(data) && data.length > 0) shieldItem = data[0];
          else if (data && typeof data === 'object') {
            if ('items' in data) shieldItem = (data as any).items?.[0] || null;
            else shieldItem = data;
          }
        }

        setLoadedItems(prev => ({
          ...prev,
          [key]: {
            items: [],
            isPack: false,
            weaponItems: weaponItems,
            shieldItem: shieldItem,
            isShieldOption: true,
          }
        }));

        if (weaponItems.length === 1) {
          setSelectedEquipment(prev => ({
            ...prev,
            [choiceIndex]: {
              ...prev[choiceIndex],
              specificItemIds: [weaponItems[0]._id],
            }
          }));
        }
      } catch (e) {
        console.error('Ошибка загрузки оружия и щита:', e);
        setLoadedItems(prev => ({
          ...prev,
          [key]: {
            items: [],
            isPack: false,
            weaponItems: [],
            shieldItem: null,
            isShieldOption: true,
          }
        }));
      }
      return;
    }

    if (isMultiSelect) {
      const searchName = option[0]?.name || '';
      try {
        const result = await searchEquipment(searchName);
        let itemsResult: any[] = [];
        if (Array.isArray(result)) {
          itemsResult = result;
        } else if (result && typeof result === 'object' && 'items' in result) {
          itemsResult = (result as any).items || [];
        } else if (result && typeof result === 'object' && 'type' in result && 'data' in result) {
          const data = (result as any).data;
          if (Array.isArray(data)) itemsResult = data;
          else if (data && typeof data === 'object') {
            if ('items' in data) itemsResult = (data as any).items || [];
            else itemsResult = [data];
          }
        }
        const isCategoryChoice = itemsResult.length > 1;
        setLoadedItems(prev => ({
          ...prev,
          [key]: {
            items: itemsResult,
            isPack: false,
            isMultiSelect: isCategoryChoice,
            maxSelect: isCategoryChoice ? maxSelect : undefined,
            fixedCount: isCategoryChoice ? undefined : totalCount,
          }
        }));

        if (!isCategoryChoice && itemsResult.length === 1) {
          setSelectedEquipment(prev => ({
            ...prev,
            [choiceIndex]: {
              ...prev[choiceIndex],
              specificItemIds: [itemsResult[0]._id],
            },
          }));
        }
      } catch (e) {
        console.error('Ошибка загрузки для множественного выбора:', e);
        setLoadedItems(prev => ({
          ...prev,
          [key]: {
            items: [],
            isPack: false,
            isMultiSelect: false,
            fixedCount: totalCount,
          }
        }));
      }
      return;
    }

    if (option.length > 1) {
      const names = option.map((item: any) => item.name).filter(Boolean);
      try {
        const results = await Promise.all(names.map((name: string) => searchEquipment(name)));
        let allItems: any[] = [];
        let isPack = false;
        for (const result of results) {
          if (Array.isArray(result)) {
            allItems = allItems.concat(result);
          } else if (result && typeof result === 'object' && 'type' in result && 'data' in result) {
            const data = (result as any).data;
            if (Array.isArray(data)) allItems = allItems.concat(data);
            else if (data && typeof data === 'object') {
              if ('items' in data) {
                allItems = allItems.concat((data as any).items || []);
                isPack = true;
              } else {
                allItems.push(data);
              }
            }
          } else if (result && typeof result === 'object' && 'items' in result) {
            const data = result as { items: any[]; isPack?: boolean };
            allItems = allItems.concat(data.items || []);
            isPack = isPack || (data.isPack || false);
          }
        }
        setLoadedItems(prev => ({
          ...prev,
          [key]: { items: allItems, isPack, isMultiSelect: false, isComposite: true },
        }));
        if (allItems.length > 0) {
          setSelectedEquipment(prev => ({
            ...prev,
            [choiceIndex]: {
              ...prev[choiceIndex],
              specificItemIds: allItems.map((item: any) => item._id),
            }
          }));
        }
      } catch (e) {
        console.error('Ошибка загрузки составной опции:', e);
        const items = option
          .map((item: any) => {
            const name = item.name || '';
            if (!name) return null;
            return {
              _id: `${key}-${name}`,
              name: name,
              cost: '—',
              weight: '—',
              detail: '',
              type: 'item' as const,
            };
          })
          .filter((item: any) => item !== null);
        setLoadedItems(prev => ({
          ...prev,
          [key]: { items, isPack: false, isMultiSelect: false, isComposite: true },
        }));
      }
      return;
    }

    const optionName = option[0]?.name || '';
    if (!optionName || optionName.trim() === '') {
      setLoadedItems(prev => ({ ...prev, [key]: { items: [], isPack: false, isMultiSelect: false } }));
      return;
    }

    try {
      const result = await searchEquipment(optionName);
      let itemsResult: any[] = [];
      let isPackResult = false;

      if (Array.isArray(result)) {
        itemsResult = result;
      } else if (result && typeof result === 'object' && 'type' in result && 'data' in result) {
        const data = (result as any).data;
        if (Array.isArray(data)) itemsResult = data;
        else if (data && typeof data === 'object') {
          if ('items' in data) {
            itemsResult = (data as any).items || [];
            isPackResult = true;
          } else {
            itemsResult = [data];
          }
        }
      } else if (result && typeof result === 'object' && 'items' in result) {
        const data = result as { items: any[]; isPack?: boolean };
        itemsResult = data.items || [];
        isPackResult = data.isPack || false;
      }

      setLoadedItems(prev => ({ ...prev, [key]: { items: itemsResult, isPack: isPackResult, isMultiSelect: false } }));
      if (itemsResult.length === 1) {
        setSelectedEquipment(prev => ({
          ...prev,
          [choiceIndex]: {
            ...prev[choiceIndex],
            specificItemIds: [itemsResult[0]._id],
          }
        }));
      }
    } catch (e) {
      console.error('Ошибка загрузки предметов:', e);
      setLoadedItems(prev => ({ ...prev, [key]: { items: [], isPack: false, isMultiSelect: false } }));
    }
  }, [choices, loadedItems]);

  const handleEquipmentOptionSelect = useCallback((choiceIndex: number, optionIndex: number) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [choiceIndex]: { optionIndex, specificItemIds: [] }
    }));
    loadItemsForOption(choiceIndex, optionIndex);
  }, [loadItemsForOption]);

  useEffect(() => {
    Object.entries(selectedEquipment).forEach(([choiceIndex, selection]) => {
      const index = Number(choiceIndex);
      const key = `${index}-${selection.optionIndex}`;

      if (!loadedItems[key]) {
        void loadItemsForOption(index, selection.optionIndex);
      }
    });
  }, [selectedEquipment, loadedItems, loadItemsForOption]);

  const handleSpecificItemSelect = useCallback((choiceIndex: number, itemId: string) => {
    setSelectedEquipment(prev => {
      const current = prev[choiceIndex];
      if (!current) return prev;
      const ids = [...(current.specificItemIds || [])];
      const key = `${choiceIndex}-${current.optionIndex}`;
      const data = loadedItems[key];

      if (data?.isMultiSelect) {
        const maxSelect = data.maxSelect || 1;
        // Всегда добавляем, если не превышен лимит. Удаление – только через чипсы.
        if (ids.length < maxSelect) {
          ids.push(itemId);
        }
      } else {
        // Обычный toggle (одиночный выбор)
        if (ids.includes(itemId)) {
          return { ...prev, [choiceIndex]: { ...current, specificItemIds: ids.filter(id => id !== itemId) } };
        }
        if (ids.length >= 1) return prev;
        ids.push(itemId);
      }
      return { ...prev, [choiceIndex]: { ...current, specificItemIds: ids } };
    });
  }, [loadedItems]);

  const handleRemoveSpecificItem = useCallback((choiceIndex: number, itemId: string) => {
    setSelectedEquipment(prev => {
      const current = prev[choiceIndex];
      if (!current) return prev;
      const ids = current.specificItemIds || [];
      const index = ids.indexOf(itemId);
      if (index === -1) return prev;
      const newIds = [...ids];
      newIds.splice(index, 1);
      return { ...prev, [choiceIndex]: { ...current, specificItemIds: newIds } };
    });
  }, []);

  return {
    selectedEquipment,
    loadedItems,
    itemSearchQueries,
    setItemSearchQuery,
    filterWeaponItems,
    filterItems,
    handleEquipmentOptionSelect,
    handleSpecificItemSelect,
    handleRemoveSpecificItem,
  };
}
