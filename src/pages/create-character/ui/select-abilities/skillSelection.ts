import type { Class } from "../../../../api";

export const isSkillSelectionValid = (
  selectedSkills: string[],
  selectedClass: Class | null,
) =>
  Boolean(
    selectedClass &&
      selectedSkills.length === selectedClass.proficiencies.skills.number_to_choose,
  );
