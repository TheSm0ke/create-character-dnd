const BASE_URL = 'http://localhost:5000/api';

const getErrorMessage = async (response: Response) => {
  const fallbackMessage = 'Не удалось выполнить запрос к серверу.';

  try {
    const data: unknown = await response.json();
    if (
      typeof data === 'object'
      && data !== null
      && 'message' in data
      && typeof data.message === 'string'
    ) {
      return data.message;
    }
  } catch {
    // Ответ сервера может быть не в формате JSON.
  }

  return fallbackMessage;
};

export const get = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  return response.json() as Promise<T>;
};

export const post = async <TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<TResponse>;
};

export const patch = async <TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<TResponse>;
};

export const remove = async (endpoint: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};
