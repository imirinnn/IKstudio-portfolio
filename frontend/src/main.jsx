import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import NotFound from './pages/NotFound';
import { usePath } from './router';
import './styles/index.css';

function Root() {
  const path = usePath();
  return path === '/' || path === '/index.html' ? <App /> : <NotFound />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
