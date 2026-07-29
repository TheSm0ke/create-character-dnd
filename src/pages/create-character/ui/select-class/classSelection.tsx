import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { ClassConfiguration } from './class-configuration/ClassConfiguration';
import { ClassList } from './classList';
import type { Class, Spell } from '../../../../api';
import { SubclassSelection } from './class-configuration/ui/SubclassSelection';
import { getSubclassUnlockLevel } from './class-configuration/subclassUtils';

export interface ClassConfiguration {
  skills: string[];
  equipment: string[][];
  subclass?: string;
  instruments?: string[];
  cantrips: Spell[];
  spells1: Spell[];
}

interface ClassSelectionProps {
  classes: Class[];
  initialSelectedClass?: Class | null;
  initialSelectedSubclass?: string;
  onSelect: (classData: Class, config: ClassConfiguration) => void;
  onClassSelected: (classData: Class) => void;
  onConfigurationChange: (config: ClassConfiguration | null) => void;
  onConfigurationStart: () => void;
  onSectionValidityChange: (
    section: 'class' | 'equipment' | 'magic',
    isValid: boolean,
  ) => void;
  section: 'class' | 'equipment' | 'magic';
}

export const ClassSelection = ({
  classes,
  initialSelectedClass = null,
  initialSelectedSubclass = '',
  onSelect,
  onClassSelected,
  onConfigurationChange,
  onConfigurationStart,
  onSectionValidityChange,
  section,
}: ClassSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(initialSelectedClass);
  const [selectedSubclass, setSelectedSubclass] = useState(initialSelectedSubclass);
  const [isSubclassDialogOpen, setIsSubclassDialogOpen] = useState(false);

  const hasAvailableSubclass = selectedClass?.subclasses.some(
    (subclass) => getSubclassUnlockLevel(subclass) <= 1,
  ) ?? false;
  const subclassSelectionRequired = hasAvailableSubclass && !selectedSubclass;

  const handleClassSelect = (classData: Class) => {
    if (selectedClass?._id === classData._id) {
      setIsSubclassDialogOpen(classData.subclasses.length > 0);
      return;
    }

    onConfigurationStart();
    onClassSelected(classData);
    setSelectedClass(classData);
    setSelectedSubclass('');
    setIsSubclassDialogOpen(classData.subclasses.length > 0);
  };

  const handleSubclassDialogClose = () => {
    if (subclassSelectionRequired) return;
    setIsSubclassDialogOpen(false);
  };

  const handleConfigurationChange = (config: ClassConfiguration | null) => {
    onConfigurationChange(config);
    if (selectedClass && config) onSelect(selectedClass, config);
  };

  return (
    <>
      {section === 'class' && (
        <ClassList
          classes={classes}
          selectedClass={selectedClass}
          onSelect={handleClassSelect}
        />
      )}

      {selectedClass && (
        <Box sx={{ display: section === 'class' ? 'none' : 'block' }}>
          <ClassConfiguration
            key={selectedClass._id}
            classData={selectedClass}
            onConfigurationChange={handleConfigurationChange}
            selectSkills={false}
            section={section}
            selectedSubclass={selectedSubclass}
            onSectionValidityChange={onSectionValidityChange}
          />
        </Box>
      )}

      <Dialog
        open={isSubclassDialogOpen && Boolean(selectedClass)}
        onClose={handleSubclassDialogClose}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: 'min(1200px, calc(100vw - 32px))',
              maxHeight: '92vh',
            },
          },
        }}
      >
        <DialogTitle>Подклассы: {selectedClass?.name}</DialogTitle>
        <DialogContent dividers>
          {!hasAvailableSubclass && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              На 1-м уровне выбор подкласса недоступен. Все варианты показаны для ознакомления;
              выбрать подкласс можно будет при достижении указанного уровня.
            </Typography>
          )}
          {selectedClass && (
            <SubclassSelection
              subclasses={selectedClass.subclasses}
              selectedSubclass={selectedSubclass}
              currentLevel={1}
              onChange={setSelectedSubclass}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setIsSubclassDialogOpen(false)}
          >
            Назад к классам
          </Button>
          <Button
            variant="contained"
            onClick={handleSubclassDialogClose}
            disabled={subclassSelectionRequired}
          >
            {hasAvailableSubclass ? 'Подтвердить' : 'Понятно'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
