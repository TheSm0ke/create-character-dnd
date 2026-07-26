import type { Subclass } from '../../../../../api';

export const getSubclassUnlockLevel = (subclass: Subclass) => {
  const featureLevels = subclass.features
    .map((feature) => feature.level)
    .filter((level) => Number.isInteger(level) && level > 0);

  return featureLevels.length > 0 ? Math.min(...featureLevels) : 1;
};
