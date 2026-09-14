import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ProvedorAuth from './autenticacao/ProvedorAuth';
import ProvedorToast from './componentes/ProvedorToast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorToast>
        <ProvedorAuth>
          <App />
        </ProvedorAuth>
      </ProvedorToast>
    </BrowserRouter>
  </StrictMode>,
);
