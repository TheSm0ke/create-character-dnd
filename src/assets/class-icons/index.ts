import barbarianBackground from './barbarian.webp';
import bardBackground from './bard.webp';
import clericBackground from './cleric.webp';
import druidBackground from './druid.webp';
import fighterBackground from './fighter.webp';
import monkBackground from './monk.webp';
import paladinBackground from './paladin.webp';
import rangerBackground from './ranger.webp';
import rogueBackground from './rogue.webp';
import sorcererBackground from './sorcerer.webp';
import warlockBackground from './warlock.webp';
import wizardBackground from './wizard.webp';
import artificerBackground from './artificer.webp';

const classBackgroundImages: Record<string, string> = {
  'Бард': bardBackground,
  'Варвар': barbarianBackground,
  'Воин': fighterBackground,
  'Волшебник': wizardBackground,
  'Чародей': sorcererBackground,
  'Следопыт': rangerBackground,
  'Плут': rogueBackground,
  'Паладин': paladinBackground,
  'Монах': monkBackground,
  'Колдун': warlockBackground,
  'Жрец': clericBackground,
  'Друид': druidBackground,
  'Изобретатель': artificerBackground,
};

export const getClassBackgroundImage = (className: string) => classBackgroundImages[className];
