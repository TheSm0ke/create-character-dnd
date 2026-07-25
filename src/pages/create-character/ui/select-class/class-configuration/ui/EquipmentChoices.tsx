/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, useTheme, OutlinedInput, InputAdornment } from '@mui/material';
import { EquipmentItemCard } from '../EquipmentItemCard';
import { getItemType } from '../utils/equipmentUtils';
import { searchIcon } from '../constants';

interface EquipmentChoicesProps {
  choices: any[];
  selectedEquipment: { [key: number]: { optionIndex: number; specificItemId?: string } };
  loadedItems: { [key: string]: any };
  itemSearchQueries: { [key: number]: string };
  setItemSearchQuery: (idx: number, query: string) => void;
  filterWeaponItems: (idx: number) => any[];
  filterItems: (idx: number) => any[];
  handleEquipmentOptionSelect: (choiceIndex: number, optionIndex: number) => void;
  handleSpecificItemSelect: (choiceIndex: number, itemId: string) => void;
}

export const EquipmentChoices: React.FC<EquipmentChoicesProps> = ({
  choices,
  selectedEquipment,
  loadedItems,
  itemSearchQueries,
  setItemSearchQuery,
  filterWeaponItems,
  filterItems,
  handleEquipmentOptionSelect,
  handleSpecificItemSelect,
}) => {
  const theme = useTheme();

  return (
    <>
      {choices.map((choice, idx) => {
        const selection = selectedEquipment[idx];
        const selectedOptionIndex = selection?.optionIndex;
        const selectedOption = selectedOptionIndex !== undefined ? choice.options[selectedOptionIndex] : null;
        const selectedOptionName = selectedOption?.[0]?.name || '';

        const key = `${idx}-${selectedOptionIndex}`;
        const loadedData = loadedItems[key];
        const items = loadedData?.items || [];
        const isPack = loadedData?.isPack || false;
        const isLoading = selectedOptionIndex !== undefined && !loadedData;
        const isMultiItem = selectedOption && selectedOption.length > 1;
        const isShieldOption = loadedData?.isShieldOption || false;

        return (
          <Box key={idx} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
              {choice.description}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
              {choice.options.map((option: any, optIdx: number) => {
                const isSelected = selectedOptionIndex === optIdx;
                const label = option.map((item: any) => `${item.name} ${item.count > 1 ? `(×${item.count})` : ''}`).join(', ');
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

            {selectedOptionIndex !== undefined && (
              <>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block' }}>
                  Выбрано: {selectedOptionName}
                </Typography>

                {isLoading ? (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Загрузка...
                  </Typography>
                ) : (
                  (() => {
                    if (isShieldOption) {
                      const shieldItem = loadedData?.shieldItem;

                      return (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
                            Выберите оружие:
                          </Typography>
                          <OutlinedInput
                            placeholder="Поиск оружия..."
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
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1, mt: 1 }}>
                            {filterWeaponItems(idx).filter((item: any) => item != null).map((item: any, itemIdx: number) => {
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

                          {shieldItem && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                                Щит (включён в комплект):
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1 }}>
                                {(() => {
                                  const type = getItemType(shieldItem);
                                  return (
                                    <EquipmentItemCard
                                      key="shield"
                                      item={shieldItem}
                                      type={type}
                                      selected={true}
                                      onSelect={() => {}}
                                      disabled={true}
                                    />
                                  );
                                })()}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      );
                    }

                    const validItems = items.filter((item: any) => item != null);
                    if (validItems.length === 0) {
                      return (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Предметы не найдены
                        </Typography>
                      );
                    }

                    if (isPack || isMultiItem) {
                      return (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                            {isPack ? 'Состав:' : 'Включает:'}
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1 }}>
                            {validItems.map((item: any, i: number) => {
                              const type = getItemType(item);
                              return (
                                <EquipmentItemCard
                                  key={i}
                                  item={item}
                                  type={type}
                                  selected={true}
                                  onSelect={() => {}}
                                  disabled={true}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      );
                    }

                    if (validItems.length > 1) {
                      return (
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
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 1, mt: 1 }}>
                            {filterItems(idx).filter((item: any) => item != null).map((item: any, itemIdx: number) => {
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
                      );
                    }

                    const selectedItem = validItems[0];
                    const type = getItemType(selectedItem);
                    return (
                      <Box sx={{ mt: 1, maxWidth: '300px' }}>
                        <EquipmentItemCard
                          item={selectedItem}
                          type={type}
                          selected={true}
                          onSelect={() => {}}
                          disabled={true}
                        />
                      </Box>
                    );
                  })()
                )}
              </>
            )}
          </Box>
        );
      })}
    </>
  );
};