import { AppLanguageCode, DeviceLocalityInfo, LanguageMeta } from '../types/contactWays';

export const ROOT_SUPER_MANAGER_EMAIL = 'zoharrb@gmail.com';

export const APP_LANGUAGES: LanguageMeta[] = [
  {
    code: 'he',
    displayLabel: 'עברית',
    englishName: 'Hebrew',
    nativeCountry: 'ישראל (IL)',
    toggleBadge: 'IL',
    flagEmoji: '🇮🇱',
    dir: 'rtl',
    israelOnlyByDefault: true,
  },
  {
    code: 'en',
    displayLabel: 'English',
    englishName: 'English',
    nativeCountry: 'International',
    toggleBadge: 'GB',
    flagEmoji: '🇬🇧',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'it',
    displayLabel: 'Italiano',
    englishName: 'Italian',
    nativeCountry: 'Italia',
    toggleBadge: 'IT',
    flagEmoji: '🇮🇹',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'de',
    displayLabel: 'Deutsch',
    englishName: 'German',
    nativeCountry: 'Deutschland / DACH',
    toggleBadge: 'DE',
    flagEmoji: '🇩🇪',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'es',
    displayLabel: 'Español',
    englishName: 'Spanish',
    nativeCountry: 'España / LatAm',
    toggleBadge: 'ES',
    flagEmoji: '🇪🇸',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'uk',
    displayLabel: 'Українська',
    englishName: 'Ukrainian',
    nativeCountry: 'Україна',
    toggleBadge: 'UA',
    flagEmoji: '🇺🇦',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'pt',
    displayLabel: 'Português',
    englishName: 'Portuguese',
    nativeCountry: 'Portugal / Brasil',
    toggleBadge: 'PT',
    flagEmoji: '🇵🇹',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'ru',
    displayLabel: 'Русский',
    englishName: 'Russian',
    nativeCountry: 'Русскоязычный',
    toggleBadge: 'RU',
    flagEmoji: '🇷🇺',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'ko',
    displayLabel: '한국어',
    englishName: 'Korean',
    nativeCountry: '대한민국 (Korea)',
    toggleBadge: 'KO',
    flagEmoji: '🇰🇷',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
  {
    code: 'ja',
    displayLabel: '日本語',
    englishName: 'Japanese',
    nativeCountry: '日本 (Japan)',
    toggleBadge: 'JA',
    flagEmoji: '🇯🇵',
    dir: 'ltr',
    israelOnlyByDefault: false,
  },
];

const ISRAEL_TIMEZONES = new Set([
  'Asia/Jerusalem',
  'Asia/Tel_Aviv',
  'Israel',
  'Asia/Hebron',
]);

export function getLanguageMeta(code: AppLanguageCode): LanguageMeta {
  return APP_LANGUAGES.find((l) => l.code === code) || APP_LANGUAGES[1];
}

export function detectBrowserLocality(): DeviceLocalityInfo {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const navLangs =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? Array.from(navigator.languages)
        : [navigator.language || 'en-US']
      : ['en-US'];

  const primary = navLangs[0] || 'en-US';
  const [rawLang = 'en', rawRegion = ''] = primary.split(/[-_]/);
  const langCode = rawLang.toLowerCase();
  const regionCode = rawRegion.toUpperCase();

  const hasIsraelLang = navLangs.some((tag) => {
    const lower = tag.toLowerCase();
    return lower === 'he' || lower === 'iw' || lower.startsWith('he-') || lower.startsWith('iw-') || lower.endsWith('-il');
  });

  const isIsrael = hasIsraelLang || regionCode === 'IL' || ISRAEL_TIMEZONES.has(tz);
  const effectiveCountry = regionCode || (isIsrael ? 'IL' : 'INTL');

  return {
    languageCode: langCode,
    countryCode: effectiveCountry,
    timeZoneId: tz || 'UTC',
    localeTag: primary,
    isIsraelDeviceLocality: isIsrael,
    source: 'browser',
  };
}

export function detectInitialLanguage(locality: DeviceLocalityInfo): AppLanguageCode {
  const { languageCode, countryCode, isIsraelDeviceLocality } = locality;
  if (languageCode === 'it' || countryCode === 'IT') return 'it';
  if (languageCode === 'de' || ['DE', 'AT', 'CH'].includes(countryCode)) return 'de';
  if (languageCode === 'es' || ['ES', 'MX', 'AR', 'CO', 'CL', 'PE'].includes(countryCode)) return 'es';
  if (languageCode === 'uk' || countryCode === 'UA') return 'uk';
  if (languageCode === 'pt' || ['PT', 'BR'].includes(countryCode)) return 'pt';
  if (languageCode === 'ru' || countryCode === 'RU') return 'ru';
  if (languageCode === 'ko' || countryCode === 'KR') return 'ko';
  if (languageCode === 'ja' || countryCode === 'JP') return 'ja';
  if (isIsraelDeviceLocality) return 'he';
  return 'en';
}

/**
 * Returns default suggested languages for the detected locality.
 * Hebrew (he) is suggested ONLY when locality is Israel (IL).
 */
export function getSuggestedLanguages(isIsraelLocality: boolean): LanguageMeta[] {
  return APP_LANGUAGES.filter((l) => !l.israelOnlyByDefault || isIsraelLocality);
}

/**
 * Search-gated language window filter:
 * - In Israel: Hebrew is always suggested and searchable.
 * - Outside Israel: Hebrew is NOT suggested by default and appears ONLY if the user searches "עברית".
 */
export function filterLanguagesForSearchWindow(
  query: string,
  isIsraelLocality: boolean,
): LanguageMeta[] {
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  if (!trimmed) {
    return getSuggestedLanguages(isIsraelLocality);
  }

  const searchedHebrewExactWord = trimmed.includes('עברית');

  return APP_LANGUAGES.filter((lang) => {
    if (lang.code === 'he' && !isIsraelLocality) {
      return searchedHebrewExactWord;
    }
    return (
      lang.displayLabel.toLowerCase().includes(normalized) ||
      lang.englishName.toLowerCase().includes(normalized) ||
      lang.nativeCountry.toLowerCase().includes(normalized) ||
      lang.code.toLowerCase().includes(normalized) ||
      lang.toggleBadge.toLowerCase().includes(normalized)
    );
  });
}

type LangPack = Record<Exclude<AppLanguageCode, 'he' | 'en'>, string>;

const BY_ENGLISH_KEY: Record<string, LangPack> = {
  Home: { it: 'Home', de: 'Start', es: 'Inicio', uk: 'Головна', pt: 'Início', ru: 'Главная', ko: '홈', ja: 'ホーム' },
  Records: { it: 'Diario', de: 'Einträge', es: 'Registros', uk: 'Записи', pt: 'Registos', ru: 'Записи', ko: '기록', ja: '記録' },
  'New Reflection': {
    it: 'Nuova Riflessione',
    de: 'Neue Reflexion',
    es: 'Nueva Reflexión',
    uk: 'Нова Рефлексія',
    pt: 'Nova Reflexão',
    ru: 'Новая Рефлексия',
    ko: '새 성찰',
    ja: '新しいリフレクション',
  },
  Inquiries: { it: 'Indagini', de: 'Impulse', es: 'Indagaciones', uk: 'Бесіди', pt: 'Diálogos', ru: 'Беседы', ko: '탐구', ja: '対話' },
  Progress: { it: 'Progressi', de: 'Fortschritt', es: 'Progreso', uk: 'Прогрес', pt: 'Progresso', ru: 'Прогресс', ko: '진행도', ja: '進捗' },
  Profile: { it: 'Profilo', de: 'Profil', es: 'Perfil', uk: 'Профіль', pt: 'Perfil', ru: 'Профиль', ko: '프로필', ja: 'プロフィール' },
  'Manager Studio': {
    it: 'Studio Gestori',
    de: 'Manager-Studio',
    es: 'Estudio Gestor',
    uk: 'Студія Менеджера',
    pt: 'Estúdio Gestor',
    ru: 'Студия Менеджера',
    ko: '관리자 스튜디오',
    ja: '管理スタジオ',
  },
  'Somatic Attunement': {
    it: 'Sintonizzazione Somatica',
    de: 'Somatische Einstimmung',
    es: 'Sintonización Somática',
    uk: 'Соматичне Співналаштування',
    pt: 'Sintonização Somática',
    ru: 'Соматическая Сонастройка',
    ko: '소마틱 동조',
    ja: 'ソマティック・アチューンメント',
  },
  'Weight Sharing': {
    it: 'Condivisione del Peso',
    de: 'Gewichtsteilung',
    es: 'Peso Compartido',
    uk: 'Розподіл Ваги',
    pt: 'Partilha de Peso',
    ru: 'Разделение Веса',
    ko: '무게 공유',
    ja: 'ウェイト・シェアリング',
  },
  'Boundaries & Consent': {
    it: 'Confini e Consenso',
    de: 'Grenzen & Konsens',
    es: 'Límites y Consentimiento',
    uk: 'Межі та Згода',
    pt: 'Limites e Consentimento',
    ru: 'Границы и Согласие',
    ko: '경계와 동의',
    ja: '境界線と同意',
  },
  'Falling & Momentum': {
    it: 'Caduta e Slancio',
    de: 'Fallen & Schwung',
    es: 'Caída e Impulso',
    uk: 'Падіння та Імпульс',
    pt: 'Queda e Impulso',
    ru: 'Падение и Импульс',
    ko: '낙하와 모멘텀',
    ja: '落下とモ멘タム',
  },
  'Grounding (Small Dance)': {
    it: 'Radicamento (Small Dance)',
    de: 'Erdung (Small Dance)',
    es: 'Enraizamiento (Small Dance)',
    uk: 'Заземлення (Малий Танець)',
    pt: 'Enraizamento (Small Dance)',
    ru: 'Заземление (Малый Танец)',
    ko: '그라운딩 (스몰 댄스)',
    ja: 'グラウンディング (スモールダンス)',
  },
  'Tactile Attention': {
    it: 'Attenzione Tattile',
    de: 'Taktile Aufmerksamkeit',
    es: 'Atención Táctil',
    uk: 'Тактильна Увага',
    pt: 'Atenção Tátil',
    ru: 'Тактильное Внимание',
    ko: '촉각적 주의',
    ja: '触覚的注意',
  },
  Attunement: { it: 'Ascolto', de: 'Resonanz', es: 'Escucha', uk: 'Слухання', pt: 'Escuta', ru: 'Слушание', ko: '경청', ja: '共鳴' },
  Weight: { it: 'Peso', de: 'Gewicht', es: 'Peso', uk: 'Вага', pt: 'Peso', ru: 'Вес', ko: '무게', ja: '重み' },
  Boundaries: { it: 'Confini', de: 'Grenzen', es: 'Límites', uk: 'Межі', pt: 'Limites', ru: 'Границы', ko: '경계', ja: '境界' },
  Momentum: { it: 'Slancio', de: 'Schwung', es: 'Impulso', uk: 'Імпульс', pt: 'Impulso', ru: 'Импульс', ko: '모멘텀', ja: '勢い' },
  Grounding: { it: 'Radicamento', de: 'Erdung', es: 'Tierra', uk: 'Опора', pt: 'Raiz', ru: 'Опора', ko: '접지', ja: '接地' },
  Tactile: { it: 'Tatto', de: 'Taktil', es: 'Tacto', uk: 'Дотик', pt: 'Tato', ru: 'Касание', ko: '촉각', ja: '触覚' },
  'Log a New 6-Axis Dance Reflection': {
    it: 'Registra una Nuova Riflessione sui 6 Assi',
    de: 'Neue 6-Achsen-Tanzreflexion erfassen',
    es: 'Registrar Nueva Reflexión en 6 Ejes',
    uk: 'Записати нову рефлексію за 6 осями',
    pt: 'Registar Nova Reflexão nos 6 Eixos',
    ru: 'Записать новую рефлексию по 6 осям',
    ko: '새 6축 춤 성찰 기록하기',
    ja: '新しい6軸ダンス・リフレクションを記録',
  },
  'Movement Journal': {
    it: 'Diario del Movimento',
    de: 'Bewegungstagebuch',
    es: 'Diario de Movimiento',
    uk: 'Щоденник Руху',
    pt: 'Diário de Movimento',
    ru: 'Дневник Движения',
    ko: '움직임 저널',
    ja: 'ムーブメント日記',
  },
  'Somatic Progress & Radar': {
    it: 'Progressi Somatici e Radar',
    de: 'Somatischer Fortschritt & Radar',
    es: 'Progreso Somático y Radar',
    uk: 'Соматичний Прогрес і Радар',
    pt: 'Progresso Somático e Radar',
    ru: 'Соматический Прогресс и Радар',
    ko: '소마틱 진행도 및 레이더',
    ja: 'ソマティック進捗＆レーダー',
  },
  'Somatic Inquiries & Dialogues': {
    it: 'Indagini e Dialoghi Somatici',
    de: 'Somatische Impulse & Dialoge',
    es: 'Indagaciones y Diálogos Somáticos',
    uk: 'Соматичні бесіди та діалоги',
    pt: 'Diálogos e Investigações Somáticas',
    ru: 'Соматические беседы и диалоги',
    ko: '소마틱 탐구 및 대화',
    ja: 'ソマティック対話＆探求',
  },
  'Select Language': {
    it: 'Seleziona Lingua',
    de: 'Sprache wählen',
    es: 'Seleccionar Idioma',
    uk: 'Оберіть мову',
    pt: 'Selecionar Idioma',
    ru: 'Выбрать язык',
    ko: '언어 선택',
    ja: '言語を選択',
  },
};

export function trLang(lang: AppLanguageCode, he: string, en: string): string {
  if (lang === 'he') return he;
  if (lang === 'en') return en;
  const entry = BY_ENGLISH_KEY[en];
  if (entry && entry[lang]) return entry[lang];
  return en;
}
