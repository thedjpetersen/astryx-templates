import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import './astryxTheme.css';
import './demo.css';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {DemoApp} from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <DemoApp />
  </StrictMode>,
);

