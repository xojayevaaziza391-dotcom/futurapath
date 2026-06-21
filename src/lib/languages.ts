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
  { code: 'Chinese', name: '中文', label: 'ZH', flagCode: 'cn' },
  { code: 'Japanese', name: '日本語', label: 'JA', flagCode: 'jp' },
  { code: 'Korean', name: '한국어', label: 'KO', flagCode: 'kr' },
  { code: 'Arabic', name: 'العربية', label: 'AR', flagCode: 'sa' },
  { code: 'Hindi', name: 'हिन्दी', label: 'HI', flagCode: 'in' },
  { code: 'Portuguese', name: 'Português', label: 'PT', flagCode: 'pt' },
  { code: 'Italian', name: 'Italiano', label: 'IT', flagCode: 'it' },
  { code: 'Dutch', name: 'Nederlands', label: 'NL', flagCode: 'nl' },
  { code: 'Polish', name: 'Polski', label: 'PL', flagCode: 'pl' },
  { code: 'Ukrainian', name: 'Українська', label: 'UK', flagCode: 'ua' },
  { code: 'Kazakh', name: 'Қазақша', label: 'KK', flagCode: 'kz' },
  { code: 'Indonesian', name: 'Bahasa Indonesia', label: 'ID', flagCode: 'id' },
  { code: 'Vietnamese', name: 'Tiếng Việt', label: 'VI', flagCode: 'vn' },
  { code: 'Thai', name: 'ไทย', label: 'TH', flagCode: 'th' },
  { code: 'Persian', name: 'فارسی', label: 'FA', flagCode: 'ir' },
  { code: 'Swahili', name: 'Kiswahili', label: 'SW', flagCode: 'ke' },
];

export const getLanguageByCode = (code: string) => 
  SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];

// Use w320 (high-res) source and let CSS scale down for crisp rendering on retina/high-DPI screens.
export const getFlagUrl = (isoCode: string) => {
  if (isoCode === 'global') return 'https://flagcdn.com/w320/un.png';
  return `https://flagcdn.com/w320/${isoCode.toLowerCase()}.png`;
};

// Full mapping for all ~190 countries in the app's country selector.
export const getCountryISO = (countryName: string): string => {
  const mapping: { [key: string]: string } = {
    'Global': 'global',
    'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Andorra': 'ad', 'Angola': 'ao',
    'Antigua and Barbuda': 'ag', 'Argentina': 'ar', 'Armenia': 'am', 'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az',
    'Bahamas': 'bs', 'Bahrain': 'bh', 'Bangladesh': 'bd', 'Barbados': 'bb', 'Belarus': 'by', 'Belgium': 'be',
    'Belize': 'bz', 'Benin': 'bj', 'Bhutan': 'bt', 'Bolivia': 'bo', 'Bosnia and Herzegovina': 'ba', 'Botswana': 'bw',
    'Brazil': 'br', 'Brunei': 'bn', 'Bulgaria': 'bg', 'Burkina Faso': 'bf', 'Burundi': 'bi',
    'Cabo Verde': 'cv', 'Cambodia': 'kh', 'Cameroon': 'cm', 'Canada': 'ca', 'Central African Republic': 'cf', 'Chad': 'td',
    'Chile': 'cl', 'China': 'cn', 'Colombia': 'co', 'Comoros': 'km', 'Congo': 'cg', 'Costa Rica': 'cr',
    'Croatia': 'hr', 'Cuba': 'cu', 'Cyprus': 'cy', 'Czech Republic': 'cz',
    'Denmark': 'dk', 'Djibouti': 'dj', 'Dominica': 'dm', 'Dominican Republic': 'do',
    'Ecuador': 'ec', 'Egypt': 'eg', 'El Salvador': 'sv', 'Equatorial Guinea': 'gq', 'Eritrea': 'er', 'Estonia': 'ee', 'Eswatini': 'sz', 'Ethiopia': 'et',
    'Fiji': 'fj', 'Finland': 'fi', 'France': 'fr',
    'Gabon': 'ga', 'Gambia': 'gm', 'Georgia': 'ge', 'Germany': 'de', 'Ghana': 'gh', 'Greece': 'gr',
    'Grenada': 'gd', 'Guatemala': 'gt', 'Guinea': 'gn', 'Guinea-Bissau': 'gw', 'Guyana': 'gy',
    'Haiti': 'ht', 'Honduras': 'hn', 'Hungary': 'hu',
    'Iceland': 'is', 'India': 'in', 'Indonesia': 'id', 'Iran': 'ir', 'Iraq': 'iq', 'Ireland': 'ie', 'Israel': 'il', 'Italy': 'it',
    'Jamaica': 'jm', 'Japan': 'jp', 'Jordan': 'jo',
    'Kazakhstan': 'kz', 'Kenya': 'ke', 'Kiribati': 'ki', 'Korea, North': 'kp', 'Korea, South': 'kr', 'Kosovo': 'xk', 'Kuwait': 'kw', 'Kyrgyzstan': 'kg',
    'Laos': 'la', 'Latvia': 'lv', 'Lebanon': 'lb', 'Lesotho': 'ls', 'Liberia': 'lr', 'Libya': 'ly', 'Liechtenstein': 'li', 'Lithuania': 'lt', 'Luxembourg': 'lu',
    'Madagascar': 'mg', 'Malawi': 'mw', 'Malaysia': 'my', 'Maldives': 'mv', 'Mali': 'ml', 'Malta': 'mt',
    'Marshall Islands': 'mh', 'Mauritania': 'mr', 'Mauritius': 'mu', 'Mexico': 'mx', 'Micronesia': 'fm', 'Moldova': 'md',
    'Monaco': 'mc', 'Mongolia': 'mn', 'Montenegro': 'me', 'Morocco': 'ma', 'Mozambique': 'mz', 'Myanmar': 'mm',
    'Namibia': 'na', 'Nauru': 'nr', 'Nepal': 'np', 'Netherlands': 'nl', 'New Zealand': 'nz', 'Nicaragua': 'ni',
    'Niger': 'ne', 'Nigeria': 'ng', 'North Macedonia': 'mk', 'Norway': 'no',
    'Oman': 'om',
    'Pakistan': 'pk', 'Palau': 'pw', 'Palestine': 'ps', 'Panama': 'pa', 'Papua New Guinea': 'pg', 'Paraguay': 'py', 'Peru': 'pe', 'Philippines': 'ph', 'Poland': 'pl', 'Portugal': 'pt',
    'Qatar': 'qa',
    'Romania': 'ro', 'Russia': 'ru', 'Rwanda': 'rw',
    'Saint Kitts and Nevis': 'kn', 'Saint Lucia': 'lc', 'Saint Vincent and the Grenadines': 'vc', 'Samoa': 'ws', 'San Marino': 'sm',
    'Sao Tome and Principe': 'st', 'Saudi Arabia': 'sa', 'Senegal': 'sn', 'Serbia': 'rs', 'Seychelles': 'sc', 'Sierra Leone': 'sl',
    'Singapore': 'sg', 'Slovakia': 'sk', 'Slovenia': 'si', 'Solomon Islands': 'sb', 'Somalia': 'so', 'South Africa': 'za',
    'South Sudan': 'ss', 'Spain': 'es', 'Sri Lanka': 'lk', 'Sudan': 'sd', 'Suriname': 'sr', 'Sweden': 'se', 'Switzerland': 'ch', 'Syria': 'sy',
    'Taiwan': 'tw', 'Tajikistan': 'tj', 'Tanzania': 'tz', 'Thailand': 'th', 'Timor-Leste': 'tl', 'Togo': 'tg', 'Tonga': 'to',
    'Trinidad and Tobago': 'tt', 'Tunisia': 'tn', 'Turkey': 'tr', 'Turkmenistan': 'tm', 'Tuvalu': 'tv',
    'Uganda': 'ug', 'Ukraine': 'ua', 'United Arab Emirates': 'ae', 'United Kingdom': 'gb', 'United States': 'us', 'Uruguay': 'uy', 'Uzbekistan': 'uz',
    'Vanuatu': 'vu', 'Vatican City': 'va', 'Venezuela': 've', 'Vietnam': 'vn',
    'Yemen': 'ye',
    'Zambia': 'zm', 'Zimbabwe': 'zw',
  };
  return mapping[countryName] || 'un';
};

export const getCountryFlag = (countryName: string) => {
  const code = getCountryISO(countryName);
  return getFlagUrl(code);
};
