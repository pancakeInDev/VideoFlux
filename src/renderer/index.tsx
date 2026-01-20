import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import { initMockApi } from './mockApi';
import App from './App';

initMockApi();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
