// Adzuna Salary API service
// Sign up at https://developer.adzuna.com/ to get an App ID and App Key
// Add to .env as VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY

export interface SalaryData {
    averageSalary: number;
    minSalary: number;
    maxSalary: number;
    currency: string;
    histogram: { range: string; count: number }[];
    jobCount: number;
    isFallback: boolean;
    fallbackCountryUsed?: string;
  }
  
  interface AdzunaHistogramResponse {
    histogram: { [salaryRange: string]: number };
  }
  
  interface AdzunaStatsResponse {
    mean: number;
    min?: number;
    max?: number;
  }
  
  const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID as string | undefined;
  const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY as string | undefined;
  const BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
  
  export class SalaryApiError extends Error {}
  
  // Adzuna only supports a fixed set of country codes
  const COUNTRY_CODE_MAP: { [key: string]: string } = {
    'United States': 'us',
    'United Kingdom': 'gb',
    'Germany': 'de',
    'France': 'fr',
    'Australia': 'au',
    'Austria': 'at',
    'Brazil': 'br',
    'Canada': 'ca',
    'India': 'in',
    'Italy': 'it',
    'Mexico': 'mx',
    'Netherlands': 'nl',
    'New Zealand': 'nz',
    'Poland': 'pl',
    'Russia': 'ru',
    'Singapore': 'sg',
    'South Africa': 'za',
    'Spain': 'es',
    'Switzerland': 'ch',
  };
  
  function resolveCountryCode(country: string): string {
    return COUNTRY_CODE_MAP[country] || 'us'; // default to US data as a fallback baseline
  }
  
  export async function getSalaryData(career: string, country: string): Promise<SalaryData> {
    if (!APP_ID || !APP_KEY) {
      throw new SalaryApiError('Missing Adzuna API credentials in environment.');
    }
  
    const isSupported = isCountrySupported(country);
    const countryCode = resolveCountryCode(country);
    const params = new URLSearchParams({
      app_id: APP_ID,
      app_key: APP_KEY,
      what: career,
    });
  
    const [histogramRes, statsRes] = await Promise.all([
      fetch(`${BASE_URL}/${countryCode}/histogram?${params.toString()}`),
      fetch(`${BASE_URL}/${countryCode}/search/1?${params.toString()}&results_per_page=0`),
    ]);
  
    if (!histogramRes.ok) {
      if (histogramRes.status === 404) {
        throw new SalaryApiError(`Salary data is not available for ${country}. Try a major economy like the US, UK, or Germany.`);
      }
      throw new SalaryApiError(`Salary lookup failed (${histogramRes.status}).`);
    }
  
    const histogramJson: AdzunaHistogramResponse = await histogramRes.json();
    const statsJson: AdzunaStatsResponse = statsRes.ok ? await statsRes.json() : { mean: 0 };
  
    const entries = Object.entries(histogramJson.histogram || {});
    if (entries.length === 0) {
      throw new SalaryApiError(`No salary data found for "${career}" in ${country}.`);
    }
  
    const histogram = entries
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));
  
    const salaryValues = histogram.map(h => parseInt(h.range)).filter(n => !isNaN(n));
    const minSalary = Math.min(...salaryValues);
    const maxSalary = Math.max(...salaryValues);
    const totalJobs = histogram.reduce((sum, h) => sum + h.count, 0);
  
    return {
      averageSalary: Math.round(statsJson.mean) || Math.round((minSalary + maxSalary) / 2),
      minSalary,
      maxSalary,
      currency: countryCode === 'us' ? 'USD' : countryCode === 'gb' ? 'GBP' : 'USD',
      histogram,
      jobCount: totalJobs,
      isFallback: !isSupported,
      fallbackCountryUsed: !isSupported ? 'United States' : undefined,
    };
  }
  
  export function isCountrySupported(country: string): boolean {
    return country in COUNTRY_CODE_MAP;
  }
  
  export const SUPPORTED_SALARY_COUNTRIES = Object.keys(COUNTRY_CODE_MAP);
  