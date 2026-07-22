import { get } from './apiClient';

export interface ToolProperty {
  name: string;
  info: string;
}

export interface ToolSkill {
  name: string;
  difficulty: string;
}

export interface Tool {
  _id: string;
  name: string;
  category: string;       // "музыкальный инструмент", "ремесленник", "игровой набор" и т.д.
  cost: string;
  detail: string;
  weight: string;
  properties: ToolProperty[];
  skills: ToolSkill[];
}

export const fetchTools = (): Promise<Tool[]> => get<Tool[]>('/tools');
export const fetchToolById = (id: string): Promise<Tool> => get<Tool>(`/tools/${id}`);
export const searchTools = (query: { name?: string; category?: string; skill?: string }): Promise<Tool[]> => {
  const params = new URLSearchParams();
  if (query.name) params.append('name', query.name);
  if (query.category) params.append('category', query.category);
  if (query.skill) params.append('skill', query.skill);
  return get<Tool[]>(`/tools/search?${params.toString()}`);
};