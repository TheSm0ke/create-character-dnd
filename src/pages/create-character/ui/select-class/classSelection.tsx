import { useState } from 'react';
import { ClassConfiguration } from './class-configuration/ClassConfiguration';
import { ClassList } from './classList';
import type { Class, Spell } from '../../../../api';

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
  onSelect: (classData: Class, config: ClassConfiguration) => void;
  onConfigurationStart: () => void;
  onBack: () => void;
}

export const ClassSelection = ({
  classes,
  onSelect,
  onConfigurationStart,
  onBack,
}: ClassSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleClassSelect = (classData: Class) => {
    onConfigurationStart();
    setSelectedClass(classData);
  };

  const handleConfirm = (config: ClassConfiguration) => {
    if (selectedClass) {
      onSelect(selectedClass, config);
    }
  };

  if (!selectedClass) {
    return (
      <ClassList
        classes={classes}
        selectedClass={selectedClass}
        onSelect={handleClassSelect}
        onBack={onBack}
      />
    );
  }

  return (
    <ClassConfiguration
      classData={selectedClass}
      onConfirm={handleConfirm}
      selectSkills={false}
      onBack={() => setSelectedClass(null)}
    />
  );
};
