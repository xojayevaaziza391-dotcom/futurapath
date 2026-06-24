// Salary API service — combines Adzuna + RapidAPI JSearch for richer data
// Adzuna: https://developer.adzuna.com/  → VITE_ADZUNA_APP_ID, VITE_ADZUNA_APP_KEY
// RapidAPI JSearch: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch → VITE_RAPIDAPI_KEY

export interface SalaryData {
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  currency: string;
  histogram: { range: string; count: number }[];
  jobCount: number;
  isFallback: boolean;
  fallbackCountryUsed?: string;
  sources: string[]; // e.g. ['Adzuna', 'JSearch'] — shown in UI
}

interface AdzunaHistogramResponse {
  histogram: { [salaryRange: string]: number };
}

interface AdzunaStatsResponse {
  mean: number;
  min?: number;
  max?: number;
}

interface JSearchJob {
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
}

interface JSearchResponse {
  data: JSearchJob[];
}

export class SalaryApiError extends Error {}

// --- Credentials ---
const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID as string | undefined;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY as string | undefined;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined;

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com/search';

// --- Country mappings ---
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

// Currency per Adzuna country code
const CURRENCY_MAP: { [code: string]: string } = {
  us: 'USD', gb: 'GBP', de: 'EUR', fr: 'EUR', au: 'AUD',
  at: 'EUR', br: 'BRL', ca: 'CAD', in: 'INR', it: 'EUR',
  mx: 'MXN', nl: 'EUR', nz: 'NZD', pl: 'PLN', ru: 'RUB',
  sg: 'SGD', za: 'ZAR', es: 'EUR', ch: 'CHF',
};

function resolveCountryCode(country: string): string {
  return COUNTRY_CODE_MAP[country] || 'us';
}

export function isCountrySupported(country: string): boolean {
  return country in COUNTRY_CODE_MAP;
}

export const SUPPORTED_SALARY_COUNTRIES = Object.keys(COUNTRY_CODE_MAP);

// ─── Adzuna fetch ────────────────────────────────────────────────────────────
async function fetchAdzunaData(career: string, countryCode: string): Promise<{
  average: number;
  min: number;
  max: number;
  jobCount: number;
  histogram: { range: string; count: number }[];
} | null> {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return null;

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    what: career,
  });

  try {
    const [histogramRes, statsRes] = await Promise.all([
      fetch(`${ADZUNA_BASE_URL}/${countryCode}/histogram?${params}`),
      fetch(`${ADZUNA_BASE_URL}/${countryCode}/search/1?${params}&results_per_page=0`),
    ]);

    if (!histogramRes.ok) return null;

    const histogramJson: AdzunaHistogramResponse = await histogramRes.json();
    const statsJson: AdzunaStatsResponse = statsRes.ok ? await statsRes.json() : { mean: 0 };

    const entries = Object.entries(histogramJson.histogram || {});
    if (entries.length === 0) return null;

    const histogram = entries
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => parseInt(a.range) - parseInt(b.range));

    const salaryValues = histogram.map(h => parseInt(h.range)).filter(n => !isNaN(n));

    return {
      average: Math.round(statsJson.mean) || 0,
      min: Math.min(...salaryValues),
      max: Math.max(...salaryValues),
      jobCount: histogram.reduce((sum, h) => sum + h.count, 0),
      histogram,
    };
  } catch {
    return null;
  }
}

// ─── RapidAPI JSearch fetch ──────────────────────────────────────────────────
async function fetchJSearchData(career: string, country: string): Promise<{
  average: number;
  min: number;
  max: number;
  jobCount: number;
} | null> {
  if (!RAPIDAPI_KEY) return null;

  const params = new URLSearchParams({
    query: `${career} in ${country}`,
    num_pages: '1',
    date_posted: 'month',
  });

  try {
    const res = await fetch(`${JSEARCH_BASE_URL}?${params}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!res.ok) return null;

    const json: JSearchResponse = await res.json();
    const jobs = json.data || [];

    // Only jobs that have salary info
    const withSalary = jobs.filter(
      j => j.job_min_salary != null && j.job_max_salary != null
    );

    if (withSalary.length === 0) return null;

    const mins = withSalary.map(j => j.job_min_salary!);
    const maxes = withSalary.map(j => j.job_max_salary!);
    const allValues = [...mins, ...maxes];
    const average = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);

    return {
      average,
      min: Math.min(...mins),
      max: Math.max(...maxes),
      jobCount: jobs.length,
    };
  } catch {
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function getSalaryData(career: string, country: string): Promise<SalaryData> {
  const isSupported = isCountrySupported(country);
  const countryCode = resolveCountryCode(country);
  const currency = CURRENCY_MAP[countryCode] || 'USD';

  // Fetch both sources in parallel
  const [adzuna, jsearch] = await Promise.all([
    fetchAdzunaData(career, countryCode),
    fetchJSearchData(career, country),
  ]);

  if (!adzuna && !jsearch) {
    throw new SalaryApiError(`No salary data found for "${career}" in ${country}.`);
  }

  const sources: string[] = [];
  if (adzuna) sources.push('Adzuna');
  if (jsearch) sources.push('JSearch');

  // Merge: average the values from both sources when both available
  let averageSalary: number;
  let minSalary: number;
  let maxSalary: number;
  let jobCount: number;

  if (adzuna && jsearch) {
    averageSalary = Math.round((adzuna.average + jsearch.average) / 2);
    minSalary = Math.min(adzuna.min, jsearch.min);
    maxSalary = Math.max(adzuna.max, jsearch.max);
    jobCount = adzuna.jobCount + jsearch.jobCount;
  } else if (adzuna) {
    averageSalary = adzuna.average || Math.round((adzuna.min + adzuna.max) / 2);
    minSalary = adzuna.min;
    maxSalary = adzuna.max;
    jobCount = adzuna.jobCount;
  } else {
    averageSalary = jsearch!.average;
    minSalary = jsearch!.min;
    maxSalary = jsearch!.max;
    jobCount = jsearch!.jobCount;
  }

  // Use Adzuna histogram if available, otherwise generate one from JSearch data
  const histogram = adzuna?.histogram ?? generateHistogram(minSalary, maxSalary, jobCount);

  return {
    averageSalary,
    minSalary,
    maxSalary,
    currency,
    histogram,
    jobCount,
    isFallback: !isSupported,
    fallbackCountryUsed: !isSupported ? 'United States' : undefined,
    sources,
  };
}

// Generate a simple bell-curve histogram when Adzuna data isn't available
function generateHistogram(min: number, max: number, totalJobs: number): { range: string; count: number }[] {
  const buckets = 8;
  const step = Math.round((max - min) / buckets);
  if (step === 0) return [{ range: String(min), count: totalJobs }];

  return Array.from({ length: buckets }, (_, i) => {
    const range = String(min + i * step);
    // Simple bell curve: higher count in the middle
    const distFromCenter = Math.abs(i - buckets / 2) / (buckets / 2);
    const count = Math.max(1, Math.round(totalJobs * (1 - distFromCenter * 0.6) / buckets));
    return { range, count };
  });
}
