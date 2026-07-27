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
  onConfigurationChange: (config: ClassConfiguration | null) => void;
  onConfigurationStart: () => void;
}

export const ClassSelection = ({
  classes,
  onSelect,
  onConfigurationChange,
  onConfigurationStart,
}: ClassSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleClassSelect = (classData: Class) => {
    onConfigurationStart();
    setSelectedClass(classData);
  };

  const handleConfigurationChange = (config: ClassConfiguration | null) => {
    onConfigurationChange(config);
    if (selectedClass && config) onSelect(selectedClass, config);
  };

  if (!selectedClass) {
    return (
      <ClassList
        classes={classes}
        selectedClass={selectedClass}
        onSelect={handleClassSelect}
      />
    );
  }

  return (
    <ClassConfiguration
      classData={selectedClass}
      onConfigurationChange={handleConfigurationChange}
      selectSkills={false}
    />
  );
};
