import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import CreateCharacter from './pages/create-character/createCharacter';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create-character', element: <CreateCharacter /> },
]);