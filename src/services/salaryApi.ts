// Salary API service — combines Adzuna + Job Salary Data (Glassdoor/LinkedIn/ZipRecruiter)
// Adzuna: https://developer.adzuna.com/ → VITE_ADZUNA_APP_ID, VITE_ADZUNA_APP_KEY
// Job Salary Data: https://rapidapi.com/letscrape-6bRBa3QguO5/api/job-salary-data → VITE_RAPIDAPI_KEY

export interface SalaryData {
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  currency: string;
  histogram: { range: string; count: number }[];
  jobCount: number;
  isFallback: boolean;
  fallbackCountryUsed?: string;
  sources: string[];
}

interface AdzunaHistogramResponse {
  histogram: { [salaryRange: string]: number };
}

interface AdzunaStatsResponse {
  mean: number;
}

// Job Salary Data API response shape
interface JobSalaryResult {
  job_title: string;
  location: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  salary_period: string;       // "YEAR", "MONTH", "HOUR"
  salary_currency: string;     // "USD", "GBP", etc.
  publisher_name: string;      // "Glassdoor", "LinkedIn", "ZipRecruiter"
}

interface JobSalaryResponse {
  data: JobSalaryResult[];
}

export class SalaryApiError extends Error {}

// --- Credentials ---
const ADZUNA_APP_ID  = import.meta.env.VITE_ADZUNA_APP_ID  as string | undefined;
const ADZUNA_APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY as string | undefined;
const RAPIDAPI_KEY   = import.meta.env.VITE_RAPIDAPI_KEY   as string | undefined;

const ADZUNA_BASE_URL   = 'https://api.adzuna.com/v1/api/jobs';
const JOB_SALARY_URL    = 'https://job-salary-data.p.rapidapi.com/job-salary'; // ← correct endpoint

// --- Country mappings ---
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  'United States': 'us', 'United Kingdom': 'gb', 'Germany': 'de',
  'France': 'fr', 'Australia': 'au', 'Austria': 'at', 'Brazil': 'br',
  'Canada': 'ca', 'India': 'in', 'Italy': 'it', 'Mexico': 'mx',
  'Netherlands': 'nl', 'New Zealand': 'nz', 'Poland': 'pl', 'Russia': 'ru',
  'Singapore': 'sg', 'South Africa': 'za', 'Spain': 'es', 'Switzerland': 'ch',
};

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

// ─── Normalize salary to annual ──────────────────────────────────────────────
function toAnnual(value: number, period: string): number {
  switch (period?.toUpperCase()) {
    case 'HOUR':  return Math.round(value * 40 * 52);
    case 'MONTH': return Math.round(value * 12);
    default:      return Math.round(value); // YEAR or unknown
  }
}

// ─── Adzuna fetch ─────────────────────────────────────────────────────────────
async function fetchAdzunaData(career: string, countryCode: string): Promise<{
  average: number; min: number; max: number; jobCount: number;
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

// ─── Job Salary Data fetch (Glassdoor + LinkedIn + ZipRecruiter) ──────────────
async function fetchJobSalaryData(career: string, country: string): Promise<{
  average: number; min: number; max: number; publishers: string[];
} | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const params = new URLSearchParams({
      job_title: career,
      location: country,
      radius: '100',
    });

    const res = await fetch(`${JOB_SALARY_URL}?${params}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'job-salary-data.p.rapidapi.com', // ← correct host
      },
    });

    if (!res.ok) return null;

    const json: JobSalaryResponse = await res.json();
    const results = json.data || [];

    if (results.length === 0) return null;

    // Normalize all salaries to annual
    const normalized = results.map(r => ({
      min: toAnnual(r.min_salary, r.salary_period),
      max: toAnnual(r.max_salary, r.salary_period),
      median: toAnnual(r.median_salary, r.salary_period),
      publisher: r.publisher_name,
    }));

    const allMedians = normalized.map(r => r.median);
    const average = Math.round(allMedians.reduce((a, b) => a + b, 0) / allMedians.length);
    const publishers = [...new Set(normalized.map(r => r.publisher))];

    return {
      average,
      min: Math.min(...normalized.map(r => r.min)),
      max: Math.max(...normalized.map(r => r.max)),
      publishers,
    };
  } catch {
    return null;
  }
}

// ─── Generate histogram fallback ─────────────────────────────────────────────
function generateHistogram(min: number, max: number, totalJobs: number): { range: string; count: number }[] {
  const buckets = 8;
  const step = Math.round((max - min) / buckets);
  if (step === 0) return [{ range: String(min), count: totalJobs }];

  return Array.from({ length: buckets }, (_, i) => {
    const range = String(min + i * step);
    const distFromCenter = Math.abs(i - buckets / 2) / (buckets / 2);
    const count = Math.max(1, Math.round(totalJobs * (1 - distFromCenter * 0.6) / buckets));
    return { range, count };
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function getSalaryData(career: string, country: string): Promise<SalaryData> {
  const isSupported = isCountrySupported(country);
  const countryCode = resolveCountryCode(country);
  const currency = CURRENCY_MAP[countryCode] || 'USD';

  // Fetch both in parallel
  const [adzuna, jobSalary] = await Promise.all([
    fetchAdzunaData(career, countryCode),
    fetchJobSalaryData(career, country),
  ]);

  if (!adzuna && !jobSalary) {
    throw new SalaryApiError(`No salary data found for "${career}" in ${country}.`);
  }

  const sources: string[] = [];
  if (adzuna) sources.push('Adzuna');
  // Show individual publishers (Glassdoor, LinkedIn) instead of just "Job Salary Data"
  if (jobSalary) sources.push(...jobSalary.publishers);

  let averageSalary: number;
  let minSalary: number;
  let maxSalary: number;
  let jobCount: number;

  if (adzuna && jobSalary) {
    averageSalary = Math.round((adzuna.average + jobSalary.average) / 2);
    minSalary = Math.min(adzuna.min, jobSalary.min);
    maxSalary = Math.max(adzuna.max, jobSalary.max);
    jobCount = adzuna.jobCount;
  } else if (adzuna) {
    averageSalary = adzuna.average || Math.round((adzuna.min + adzuna.max) / 2);
    minSalary = adzuna.min;
    maxSalary = adzuna.max;
    jobCount = adzuna.jobCount;
  } else {
    averageSalary = jobSalary!.average;
    minSalary = jobSalary!.min;
    maxSalary = jobSalary!.max;
    jobCount = 0;
  }

  const histogram = adzuna?.histogram ?? generateHistogram(minSalary, maxSalary, jobCount || 10);

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
