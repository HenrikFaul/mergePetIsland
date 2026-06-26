// Lightweight locale registry. Full i18next wiring is layered on later; this
// keeps the settings screen and persistence honest about supported languages.

export const LOCALES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'es', label: 'Español' },
  { code: 'zh-CN', label: '中文' },
];

export const DEFAULT_LOCALE = 'en';
