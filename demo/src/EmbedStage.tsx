import {Suspense, useEffect} from 'react';

import {templates} from './templateRegistry';

/**
 * Bare template renderer for the ?embed=1 iframe used by the detail view's
 * phone artboard. Rendering inside an iframe gives the template a REAL
 * 390px viewport, so its own media queries and vw units resolve the way
 * they would on a phone — a narrowed div never could (they read the top
 * window). Route: '?embed=1&scheme=<pref>#<template-id>'.
 */
export function EmbedStage() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  const entry = templates.find(t => t.id === id) ?? templates[0];
  const Component = entry.component;

  // Mirror the parent's scheme choice (passed via query so the artboard
  // follows the toggle; the parent re-keys the iframe on change).
  useEffect(() => {
    const scheme = new URLSearchParams(window.location.search).get('scheme');
    const rootEl = document.documentElement;
    if (scheme === 'light' || scheme === 'dark') {
      rootEl.style.setProperty('color-scheme', scheme);
      rootEl.setAttribute('data-astryx-media', scheme);
    }
  }, []);

  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}

export default EmbedStage;
