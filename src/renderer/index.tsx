import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './index.css';

import { Main } from './components/main';

createRoot(document.getElementById('app') as HTMLElement).render(
  <HashRouter>
    <Main />
  </HashRouter>
);
