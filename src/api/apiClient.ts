const BASE_URL = 'http://localhost:5000/api';

export const get = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    const errorMessage = await response.text().catch(() => 'Unknown error');
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
};