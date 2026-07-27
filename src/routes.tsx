import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import CreateCharacter from './pages/create-character/createCharacter';
import CharactersList from './pages/characters/CharactersList';
import CharacterDetails from './pages/characters/CharacterDetails';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create-character', element: <CreateCharacter /> },
  { path: '/characters', element: <CharactersList /> },
  { path: '/characters/:characterId', element: <CharacterDetails /> },
]);
