import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import { router } from './routes';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';

const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
    <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);