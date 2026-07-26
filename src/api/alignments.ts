import { get } from './apiClient';

export interface Alignment {
  _id: string;
  name: string;
  abbreviation: string;
  description: string;
}

interface AlignmentsResponse {
  value: Alignment[];
  Count?: number;
}

export const fetchAlignments = async (): Promise<Alignment[]> => {
  const response = await get<Alignment[] | AlignmentsResponse>('/alignments');
  return Array.isArray(response) ? response : response.value;
};
export const fetchAlignmentById = (id: string): Promise<Alignment> => get<Alignment>(`/alignments/${id}`);
export const fetchAlignmentByName = (name: string): Promise<Alignment[]> => get<Alignment[]>(`/alignments/search?name=${encodeURIComponent(name)}`);
