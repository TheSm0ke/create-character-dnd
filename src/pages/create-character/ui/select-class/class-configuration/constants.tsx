import AcidIcon from '../../../../../assets/Acid_Damage_Icon.webp';
import BludgeoningIcon from '../../../../../assets/Bludgeoning_Damage_Icon.webp';
import ColdIcon from '../../../../../assets/Cold_Damage_Icon.webp';
import FireIcon from '../../../../../assets/Fire_Damage_Icon.webp';
import ForceIcon from '../../../../../assets/Force_Damage_Icon.webp';
import LightningIcon from '../../../../../assets/Lightning_Damage_Icon.webp';
import NecroticIcon from '../../../../../assets/Necrotic_Damage_Icon.webp';
import PiercingIcon from '../../../../../assets/Piercing_Damage_Icon.webp';
import PoisonIcon from '../../../../../assets/Poison_Damage_Icon.webp';
import PsychicIcon from '../../../../../assets/Psychic_Damage_Icon.webp';
import RadiantIcon from '../../../../../assets/Radiant_Damage_Icon.webp';
import SlashingIcon from '../../../../../assets/Slashing_Damage_Icon.webp';
import ThunderIcon from '../../../../../assets/Thunder_Damage_Icon.webp';

export const damageDetails: Record<string, { icon: string; color: string; label: string }> = {
  'Режущий': { icon: SlashingIcon, color: '#FF4D4D', label: 'Режущий' },
  'Колющий': { icon: PiercingIcon, color: '#B37400', label: 'Колющий' },
  'Дробящий': { icon: BludgeoningIcon, color: '#8C8C8C', label: 'Дробящий' },
  'Огонь': { icon: FireIcon, color: '#FB9800', label: 'Огонь' },
  'Огнём': { icon: FireIcon, color: '#FB9800', label: 'Огонь' },
  'Холод': { icon: ColdIcon, color: '#8CCEE4', label: 'Холод' },
  'Холодом': { icon: ColdIcon, color: '#8CCEE4', label: 'Холод' },
  'Молния': { icon: LightningIcon, color: '#7EADEB', label: 'Молния' },
  'Электричеством': { icon: LightningIcon, color: '#7EADEB', label: 'Молния' },
  'Кислота': { icon: AcidIcon, color: '#EBF61A', label: 'Кислота' },
  'Кислотой': { icon: AcidIcon, color: '#EBF61A', label: 'Кислота' },
  'Звук': { icon: ThunderIcon, color: '#C198FA', label: 'Звук' },
  'Звуком': { icon: ThunderIcon, color: '#C198FA', label: 'Звук' },
  'Силовой': { icon: ForceIcon, color: '#DF7E7D', label: 'Силовой' },
  'Силовым': { icon: ForceIcon, color: '#DF7E7D', label: 'Силовой' },
  'Лучистый': { icon: RadiantIcon, color: '#FCDC87', label: 'Лучистый' },
  'Излучением': { icon: RadiantIcon, color: '#FCDC87', label: 'Лучистый' },
  'Некротический': { icon: NecroticIcon, color: '#B9ECD0', label: 'Некротический' },
  'Некротической': { icon: NecroticIcon, color: '#B9ECD0', label: 'Некротический' },
  'Психический': { icon: PsychicIcon, color: '#E395CF', label: 'Психический' },
  'Психической': { icon: PsychicIcon, color: '#E395CF', label: 'Психический' },
  'Яд': { icon: PoisonIcon, color: '#E0F296', label: 'Яд' },
  'Ядом': { icon: PoisonIcon, color: '#E0F296', label: 'Яд' },
};

export const damageIcons: Record<string, string> = Object.fromEntries(
  Object.entries(damageDetails).map(([damageType, { icon }]) => [damageType, icon]),
);

export const recommendedSpells: Record<string, { cantrips: string[]; spells1: string[] }> = {
  'Бард': {
    cantrips: ['Дружба', 'Фокусы', 'Сообщение'],
    spells1: ['Лечащее слово', 'Огонь фей', 'Усыпление', 'Обнаружение магии'],
  },
  'Волшебник': {
    cantrips: ['Волшебная рука', 'Огонёк', 'Маленькая иллюзия'],
    spells1: ['Волшебная стрела', 'Щит', 'Усыпление', 'Доспехи мага', 'Обнаружение магии'],
  },
  'Колдун': {
    cantrips: ['Мистический заряд', 'Волшебная рука', 'Леденящее прикосновение'],
    spells1: ['Ведьмин снаряд', 'Щит', 'Доспехи Агатиса'],
  },
  'Чародей': {
    cantrips: ['Огненный снаряд', 'Волшебная рука', 'Леденящее прикосновение'],
    spells1: ['Волшебная стрела', 'Щит', 'Огненные ладони'],
  },
  'Друид': {
    cantrips: ['Дружба', 'Сотворение костра', 'Руки помощи'],
    spells1: ['Лечащее слово', 'Огонь фей', 'Лучезарное слово'],
  },
  'Жрец': {
    cantrips: ['Свет', 'Уход за умирающим', 'Лечащее слово'],
    spells1: ['Лечение ран', 'Благословение', 'Огонь фей'],
  },
};

export const filterChipSx = {
  color: 'white',
  padding: '8px 16px',
  height: 'auto',
  fontSize: '0.9rem',
  '& .MuiChip-label': {
    padding: '4px 12px',
  },
  '& .MuiChip-icon': {
    width: 24,
    height: 24,
  },
};

export const searchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
  </svg>
);
