import { useState } from 'react';
import { ClassConfiguration } from './class-configuration/ClassConfiguration';
import { ClassList } from './classList';
import type { Class, Spell } from '../../../../api';

interface ClassSelectionProps {
  classes: Class[];
  onSelect: (config: {
    skills: string[];
    equipment: string[][];
    subclass?: string;
    instruments?: string[];
    cantrips: Spell[];
    spells1: Spell[];
  }) => void;
  onBack: () => void;
}

export const ClassSelection = ({ classes, onSelect, onBack }: ClassSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleConfirm = (config: {
    skills: string[];
    equipment: string[][];
    subclass?: string;
    instruments?: string[];
    cantrips: Spell[];
    spells1: Spell[];
  }) => {
    onSelect(config);
  };

  if (!selectedClass) {
    return (
      <ClassList
        classes={classes}
        selectedClass={selectedClass}
        onSelect={setSelectedClass}
        onBack={onBack}
      />
    );
  }

  return (
    <ClassConfiguration
      classData={selectedClass}
      onConfirm={handleConfirm}
      onBack={() => setSelectedClass(null)}
    />
  );
};