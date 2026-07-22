// import { useState } from 'react';
// import { ClassConfiguration } from './class-configuration/ClassConfiguration';
// import { useTheme } from '@mui/material/styles';
// import { Box, Typography, Button, Chip, Divider, useMediaQuery } from '@mui/material';
// import type { Class, Spell } from '../../../../api';

// interface ClassSelectionProps {
//   classes: Class[];
//   onSelect: (config: {
//     skills: string[];
//     equipment: string[][];
//     subclass?: string;
//     instruments?: string[];
//     cantrips: Spell[];
//     spells1: Spell[];
//   }) => void;
//   onBack: () => void;
// }

// // Вспомогательный компонент для отображения одной карточки класса
// const ClassCard = ({
//   classData,
//   selected,
//   onSelect,
// }: {
//   classData: Class;
//   selected: boolean;
//   onSelect: () => void;
// }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const [hover, setHover] = useState(false);

//   const {
//     name,
//     description,
//     hit_dice,
//     primary_ability,
//     proficiencies,
//     features,
//     subclasses,
//     spellcasting,
//     levels,
//     fixed_equipment,
//     choices,
//   } = classData;

//   const handleClick = () => onSelect();

//   // Сортируем уровни
//   const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
//   const firstLevels = sortedLevels.slice(0, 3);
//   const remainingLevels = sortedLevels.length - 3;

//   // Берём первые 4 особенности
//   const firstFeatures = features.slice(0, 4);
//   const remainingFeatures = features.length - 4;

//   return (
//     <Box
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       onClick={handleClick}
//       sx={{
//         padding: isMobile ? '0px 20px 20px 20px' : '0px 25px 25px 25px',
//         borderRadius: 2,
//         border: '2px solid',
//         borderColor: selected
//           ? theme.palette.primary.main
//           : hover
//           ? theme.palette.primary.light
//           : 'rgba(255,255,255,0.08)',
//         margin: 0,
//         textAlign: 'left',
//         position: 'relative',
//         overflow: 'hidden',
//         transition: 'transform 0.25s ease, border-color 0.3s ease, background-color 0.3s ease',
//         transform: selected ? 'scale(1.02)' : hover ? 'scale(1.01)' : 'scale(1)',
//         backgroundColor: selected
//           ? 'rgba(170, 59, 255, 0.12)'
//           : hover
//           ? 'rgba(255,255,255,0.03)'
//           : 'transparent',
//         cursor: 'pointer',
//         boxShadow: selected ? `0 0 20px ${theme.palette.primary.main}40` : 'none',
//         maxHeight: 600,
//         overflowY: 'auto',
//         '&::-webkit-scrollbar': {
//           width: 4,
//         },
//         '&::-webkit-scrollbar-track': {
//           background: 'transparent',
//         },
//         '&::-webkit-scrollbar-thumb': {
//           background: theme.palette.primary.main,
//           borderRadius: 4,
//         },
//       }}
//     >
//       {/* Заголовок */}
//       <Box
//         sx={{
//           position: 'sticky',
//           top: 0,
//           backgroundColor: selected ? 'rgba(170, 59, 255, 0.12)' : 'transparent',
//           zIndex: 1,
//           paddingBottom: 1,
//           backdropFilter: 'blur(4px)',
//           borderRadius: '8px',
//         }}
//       >
//         <Typography
//           variant={isMobile ? 'h6' : 'h5'}
//           sx={{
//             color: theme.palette.common.white,
//             fontWeight: 600,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             mb: 0.5,
//           }}
//         >
//           {name}
//           {spellcasting && (
//             <span style={{ fontSize: '0.8rem', color: theme.palette.primary.main }}>✨</span>
//           )}
//         </Typography>
//         <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5, fontSize: '0.9rem' }}>
//           {description}
//         </Typography>
//         <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
//       </Box>

//       {/* Основные параметры */}
//       <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 1.5 }}>
//         <Box>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Кость HP</Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{hit_dice}</Typography>
//         </Box>
//         <Box>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Осн. хар-ка</Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{primary_ability}</Typography>
//         </Box>
//         <Box>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Спасброски</Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{proficiencies.saving_throws.join(', ')}</Typography>
//         </Box>
//         <Box>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Навыки</Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
//             {proficiencies.skills.number_to_choose} из {proficiencies.skills.list.length}
//           </Typography>
//         </Box>
//       </Box>

//       {/* Владения */}
//       {(proficiencies.armor.length > 0 || proficiencies.weapons.length > 0 || proficiencies.tools.length > 0) && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Владения</Typography>
//           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
//             {proficiencies.armor.map((item) => (
//               <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
//             ))}
//             {proficiencies.weapons.map((item) => (
//               <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
//             ))}
//             {proficiencies.tools.map((item) => (
//               <Chip key={item} label={item} size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
//             ))}
//           </Box>
//         </Box>
//       )}

//       {/* Уровни */}
//       {sortedLevels.length > 0 && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//             Уровни (всего {sortedLevels.length})
//           </Typography>
//           <Box sx={{ mt: 0.5 }}>
//             {firstLevels.map((level) => (
//               <Box key={level.level} sx={{ mb: 0.5 }}>
//                 <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
//                   Ур. {level.level}: бонус мастерства +{level.proficiency_bonus}
//                   {level.features && level.features.length > 0 && `, фич: ${level.features.length}`}
//                   {level.cantrips_known && `, заговоров: ${level.cantrips_known}`}
//                   {level.spells_known && `, заклинаний: ${level.spells_known}`}
//                   {level.slots && `, слотов: ${level.slots.join('/')}`}
//                 </Typography>
//               </Box>
//             ))}
//             {remainingLevels > 0 && (
//               <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//                 + ещё {remainingLevels} уровней
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}

//       {/* Особенности */}
//       {features.length > 0 && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//             Особенности
//           </Typography>
//           <Box sx={{ mt: 0.5 }}>
//             {firstFeatures.map((feature) => (
//               <Box key={feature.id} sx={{ mb: 0.5 }}>
//                 <Typography variant="body2" sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
//                   {feature.name} (ур. {feature.level})
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
//                   {feature.description}
//                 </Typography>
//               </Box>
//             ))}
//             {remainingFeatures > 0 && (
//               <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//                 + ещё {remainingFeatures}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}

//       {/* Фиксированное снаряжение */}
//       {fixed_equipment && fixed_equipment.length > 0 && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Вы получаете</Typography>
//           <Box sx={{ mt: 0.5 }}>
//             {fixed_equipment.map((item, idx) => (
//               <Typography key={idx} variant="body2" sx={{ color: theme.palette.common.white }}>
//                 • {item.name} {item.count > 1 && `(×${item.count})`}
//               </Typography>
//             ))}
//           </Box>
//         </Box>
//       )}

//       {/* Выборы снаряжения */}
//       {choices && choices.length > 0 && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Выбор снаряжения</Typography>
//           <Box sx={{ mt: 0.5 }}>
//             {choices.slice(0, 2).map((choice, idx) => (
//               <Box key={idx} sx={{ mb: 0.5 }}>
//                 <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
//                   {choice.description}
//                 </Typography>
//                 <Box component="ul" sx={{ m: 0, pl: 2 }}>
//                   {choice.options.slice(0, 2).map((optionGroup, i) => (
//                     <li key={i}>
//                       <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
//                         {optionGroup.map(item => `${item.name} ${item.count > 1 ? `(×${item.count})` : ''}`).join(', ')}
//                       </Typography>
//                     </li>
//                   ))}
//                   {choice.options.length > 2 && (
//                     <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//                       + ещё {choice.options.length - 2} вариантов
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
//             ))}
//             {choices.length > 2 && (
//               <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//                 + ещё {choices.length - 2} вариантов
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}

//       {/* Подклассы */}
//       {subclasses.length > 0 && (
//         <Box sx={{ mb: 1.5 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Подклассы</Typography>
//           <Box sx={{ mt: 0.5 }}>
//             {subclasses.slice(0, 2).map((sub) => (
//               <Box key={sub.id} sx={{ mb: 0.5 }}>
//                 <Typography variant="body2" sx={{ color: theme.palette.common.white }}>{sub.name}</Typography>
//                 <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
//                   {sub.description}
//                 </Typography>
//               </Box>
//             ))}
//             {subclasses.length > 2 && (
//               <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
//                 + ещё {subclasses.length - 2}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}

//       {/* Заклинания */}
//       {spellcasting && (
//         <Box sx={{ mb: 1 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Заклинания</Typography>
//           <Typography variant="body2" sx={{ color: theme.palette.common.white }}>
//             Способность: {spellcasting.ability}, Фокус: {spellcasting.focus || 'нет'}
//             {spellcasting.ritual_casting && ' (ритуалы)'}
//           </Typography>
//         </Box>
//       )}

//       {/* Индикатор выбора */}
//       {selected && (
//         <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
//           <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>Выбран</Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export const ClassSelection = ({ classes, onSelect, onBack }: ClassSelectionProps) => {
//   const theme = useTheme();
//   const [selectedClass, setSelectedClass] = useState<Class | null>(null);

//   const handleClassSelect = (cls: Class) => {
//     setSelectedClass(cls);
//   };

//   const handleConfirm = (config: {
//     skills: string[];
//     equipment: string[][];
//     subclass?: string;
//     instruments?: string[];
//     cantrips: Spell[];
//     spells1: Spell[];
//   }) => {
//     onSelect(config);
//   };

//   if (!selectedClass) {
//     return (
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h5" sx={{ color: theme.palette.common.white, mb: 2 }}>
//           Выберите класс
//         </Typography>
//         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//           {classes.map((cls) => {
//             return (
//               <Box
//                 key={cls._id}
//                 sx={{
//                   width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.33% - 10px)' },
//                 }}
//               >
//                 <ClassCard
//                   classData={cls}
//                   selected={selectedClass !== null ? selectedClass._id === cls._id : false}
//                   onSelect={() => handleClassSelect(cls)}
//                 />
//               </Box>
//             );
//           })}
//         </Box>
//         <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
//           <Button variant="outlined" onClick={onBack}>Назад</Button>
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <ClassConfiguration
//       classData={selectedClass}
//       onConfirm={handleConfirm}
//       onBack={() => setSelectedClass(null)}
//     />
//   );
// };