'use client';
import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const accent    = localStorage.getItem('resolver_accent')    || '#FFFFFF';
      const accentTxt = localStorage.getItem('resolver_accentTxt') || '#000000';
      const bg        = localStorage.getItem('resolver_themeBg')   || '#0A0A0A';

      // Apply accent
      document.documentElement.style.setProperty('--orange',      accent);
      document.documentElement.style.setProperty('--orange-text', accentTxt);

      // Apply background to html, body, and all page-bg elements
      document.documentElement.style.setProperty('--bg', bg);
      document.documentElement.style.background = bg;
      document.body.style.background    = bg;
      document.body.style.backgroundColor = bg;
      document.querySelectorAll<HTMLElement>('.page-bg').forEach(el => {
        el.style.background = bg;
      });
    } catch {}
  }, []);

  return null;
}
