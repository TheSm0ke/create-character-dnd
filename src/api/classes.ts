import { get } from './apiClient';

export interface EquipmentItem {
  name: string;
  count: number;
}
export interface SubclassFeature {
  name: string;
  level: number;
  description: string;
}

// export interface Subclass {
//   id: string;
//   name: string;
//   description: string;
//   features: SubclassFeature[];
//   class_spells?: {
//     level_requirement: number;
//     spells: string[];
//   }[];
//   source?: string;
//   special_tables?: {
//     options: {
//       effect: string;
//       value: number;
//     }[];
//     roll: string;
//     title: string;
//   }[];
// }

export interface EquipmentChoice {
  description: string;
  options: EquipmentItem[][];
}

export interface Proficiency {
  armor: string[];
  weapons: string[];
  tools: string[];
  saving_throws: string[];
  skills: {
    number_to_choose: number;
    list: string[];
  };
}

export interface Spellcasting {
  ability: string;
  focus?: string;
  ritual_casting?: boolean;
  spells_known_formula?: string;
  cantrips_known_progression?: number[];
  spells_known_progression?: number[];
  spell_slots_progression: {
    level: number;
    slots: number[];
  }[];
  // другие необязательные поля, если нужны
  class_spells?: string;
  known_spells_note?: string;
  metamagic_note?: string;
  oath_spells?: string;
  pact_magic?: boolean;
  prepared_spells_formula?: string;
  slot_level_note?: string;
  slots_note?: string;
  spellbook?: boolean;
  spells_known_note?: string;
}

export interface LevelInfo {
  level: number;
  proficiency_bonus: number;
  features: string[];
  cantrips_known?: number;
  spells_known?: number;
  slots?: number[];
  // дополнительные опциональные поля из схемы
  ki_points?: number;
  martial_arts_die?: string;
  movement_bonus?: number;
  rage_uses?: number;
  slot_level?: number;
}

export interface Feature {
  id: string;
  name: string;
  level: number;
  description: string;
  improvements: {
    level: number;
    description: string;
  }[];
  uses?: string; // опционально
}

export interface Subclass {
  id: string;
  name: string;
  description: string;
  features: {
    name: string;
    level: number;
    description: string;
  }[];
  class_spells?: {
    level_requirement: number;
    spells: string[];
  }[];
  source?: string;
  special_tables?: {
    options: {
      effect: string;
      value: number;
    }[];
    roll: string;
    title: string;
  }[];
}

export interface OptionalFeature {
  name: string;
  source: string;
  level: number;
  description: string;
}

export interface Class {
  _id: string;
  name: string;
  hit_dice: string;
  primary_ability: string;
  description: string;
  proficiencies: Proficiency;
  spellcasting?: Spellcasting;
  levels: LevelInfo[];
  features: Feature[];
  subclasses: Subclass[];
  optional_features: OptionalFeature[]; // обязательно
  fixed_equipment: EquipmentItem[];      // обязательно
  choices: EquipmentChoice[];            // обязательно
}

export const fetchClasses = (): Promise<Class[]> => get<Class[]>('/classes');
export const fetchClassById = (id: string): Promise<Class> => get<Class>(`/classes/${id}`);
export const fetchClassByName = (name: string): Promise<Class> => get<Class>(`/classes/name/${encodeURIComponent(name)}`);