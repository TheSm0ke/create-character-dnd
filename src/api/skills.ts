import { get } from './apiClient';

export interface Skill {
  _id: string;
  name: string;
  ability: string;
  description: string;
}

export const fetchSkills = (): Promise<Skill[]> => get<Skill[]>('/skills');
export const fetchSkillById = (id: string): Promise<Skill> => get<Skill>(`/skills/${id}`);
export const fetchSkillByName = (name: string): Promise<Skill[]> => get<Skill[]>(`/skills/search?name=${encodeURIComponent(name)}`);