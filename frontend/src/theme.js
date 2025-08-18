const STORAGE_KEY = 'theme'; // 'dark' | 'light'

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // respeta preferencia del SO
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initTheme() {
  const theme = getInitialTheme();
  applyTheme(theme);
  // escucha cambios del SO (opcional)
  if (!localStorage.getItem(STORAGE_KEY)) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => applyTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', handler);
  }
}
