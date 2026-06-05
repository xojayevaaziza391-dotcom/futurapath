export interface Language {
  code: string;
  name: string;
  label: string;
  flagCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'English', name: 'English', label: 'EN', flagCode: 'gb' },
  { code: 'Uzbek', name: 'O\'zbek', label: 'UZ', flagCode: 'uz' },
  { code: 'Turkish', name: 'Türkçe', label: 'TR', flagCode: 'tr' },
  { code: 'Russian', name: 'Русский', label: 'RU', flagCode: 'ru' },
  { code: 'Spanish', name: 'Español', label: 'ES', flagCode: 'es' },
  { code: 'French', name: 'Français', label: 'FR', flagCode: 'fr' },
  { code: 'German', name: 'Deutsch', label: 'DE', flagCode: 'de' },
];

export const getLanguageByCode = (code: string) => 
  SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];

export const getFlagUrl = (isoCode: string) => {
  if (isoCode === 'global') return 'https://flagcdn.com/256x192/un.png'; // Using UN flag for global
  return `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`;
};

export const getCountryISO = (countryName: string): string => {
  const mapping: { [key: string]: string } = {
    'Global': 'global',
    'Uzbekistan': 'uz',
    'Turkey': 'tr',
    'Russia': 'ru',
    'United States': 'us',
    'United Kingdom': 'gb',
    'Germany': 'de',
    'France': 'fr',
    'Spain': 'es',
    'Italy': 'it',
    'Canada': 'ca',
    'Australia': 'au',
    'Japan': 'jp',
    'China': 'cn',
    'India': 'in',
    'Brazil': 'br',
    'South Korea': 'kr',
    'United Arab Emirates': 'ae',
    'Kazakhstan': 'kk',
    'Kyrgyzstan': 'kg',
    'Tajikistan': 'tj',
    'Turkmenistan': 'tm',
    'Azerbaijan': 'az',
    'Ukraine': 'ua',
    'Poland': 'pl',
  };
  return mapping[countryName] || 'un';
};

export const getCountryFlag = (countryName: string) => {
  const code = getCountryISO(countryName);
  return getFlagUrl(code);
};
