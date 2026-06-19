// Real economic data from World Bank API
const COUNTRY_CODES: { [key: string]: string } = {
    'Uzbekistan': 'UZ', 'Russia': 'RU', 'Kazakhstan': 'KZ', 'Turkey': 'TR',
    'Germany': 'DE', 'United States': 'US', 'United Kingdom': 'GB', 'France': 'FR',
    'China': 'CN', 'Japan': 'JP', 'South Korea': 'KR', 'India': 'IN',
    'Brazil': 'BR', 'Global': 'WLD', 'Azerbaijan': 'AZ', 'Ukraine': 'UA',
    'Poland': 'PL', 'Italy': 'IT', 'Spain': 'ES', 'Australia': 'AU',
    'Canada': 'CA', 'Mexico': 'MX', 'Indonesia': 'ID', 'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE', 'Egypt': 'EG', 'Nigeria': 'NG',
  };
  
  export interface EconomicData {
    country: string;
    unemploymentRate: number | null;
    gdpGrowth: number | null;
    youthUnemployment: number | null;
    year: number;
  }
  
  const fetchIndicator = async (countryCode: string, indicator: string) => {
    try {
      const response = await fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json&mrv=1`
      );
      const data = await response.json();
      return data[1]?.[0]?.value ?? null;
    } catch {
      return null;
    }
  };
  
  export const getRealEconomicData = async (country: string): Promise<EconomicData> => {
    const code = COUNTRY_CODES[country] || 'WLD';
    const [unemployment, gdpGrowth, youthUnemployment] = await Promise.all([
      fetchIndicator(code, 'SL.UEM.TOTL.ZS'),
      fetchIndicator(code, 'NY.GDP.MKTP.KD.ZG'),
      fetchIndicator(code, 'SL.UEM.1524.ZS'),
    ]);
    return {
      country,
      unemploymentRate: unemployment,
      gdpGrowth: gdpGrowth,
      youthUnemployment: youthUnemployment,
      year: new Date().getFullYear(),
    };
  };