import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import './astryxTheme.css';
import './demo.css';
import './lucideIcons';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {DemoApp} from './App';
import {EmbedStage} from './EmbedStage';

// '?embed=1' renders a single bare template (no gallery chrome) — the detail
// view's phone artboard loads this in an iframe for a true 390px viewport.
const isEmbed = new URLSearchParams(window.location.search).has('embed');

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>{isEmbed ? <EmbedStage /> : <DemoApp />}</StrictMode>,
);

