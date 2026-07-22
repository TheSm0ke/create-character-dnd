import { get } from './apiClient';

export interface Alignment {
  _id: string;
  name: string;
  abbreviation: string;
  description: string;
}

export const fetchAlignments = (): Promise<Alignment[]> => get<Alignment[]>('/alignments');
export const fetchAlignmentById = (id: string): Promise<Alignment> => get<Alignment>(`/alignments/${id}`);
export const fetchAlignmentByName = (name: string): Promise<Alignment[]> => get<Alignment[]>(`/alignments/search?name=${encodeURIComponent(name)}`);