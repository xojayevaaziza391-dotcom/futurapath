// JSearch (RapidAPI) job listings service
// Sign up at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
// and add your key to .env as VITE_RAPIDAPI_KEY=xxxxxxxx

export interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    applyLink: string;
    postedAt?: string;
    employmentType?: string;
    salary?: string;
    logo?: string;
    isRemote: boolean;
  }
  
  interface JSearchJob {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string | null;
    job_city?: string | null;
    job_country?: string | null;
    job_description: string;
    job_apply_link: string;
    job_posted_at_datetime_utc?: string;
    job_employment_type?: string;
    job_is_remote?: boolean;
    job_min_salary?: number | null;
    job_max_salary?: number | null;
    job_salary_currency?: string | null;
    job_salary_period?: string | null;
  }
  
  interface JSearchResponse {
    status: string;
    data: JSearchJob[];
  }
  
  const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined;
  const JSEARCH_HOST = 'jsearch.p.rapidapi.com';
  
  export class JobsApiError extends Error {}
  
  /**
   * Fetch live job listings filtered by career/role query and country.
   *
   * @param career - role/keyword to search for (e.g. "Software Engineer")
   * @param countryISO - 2-letter ISO country code (e.g. "us", "uz"), or undefined/"un" for worldwide
   * @param page - 1-indexed page number
   */
  export async function fetchJobs(
    career: string,
    countryISO?: string,
    page: number = 1
  ): Promise<JobListing[]> {
    if (!RAPIDAPI_KEY) {
      throw new JobsApiError('Missing VITE_RAPIDAPI_KEY in environment configuration.');
    }
  
    const query = career.trim() || 'jobs';
    const params = new URLSearchParams({
      query,
      page: String(page),
      num_pages: '1',
    });
  
    // JSearch expects an uppercase 2-letter ISO country code; omit for global search
    if (countryISO && countryISO !== 'un' && countryISO !== 'global') {
      params.set('country', countryISO.toUpperCase());
    }
  
    const response = await fetch(`https://${JSEARCH_HOST}/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': JSEARCH_HOST,
      },
    });
  
    if (!response.ok) {
      if (response.status === 429) {
        throw new JobsApiError('Job search rate limit reached. Please try again later.');
      }
      throw new JobsApiError(`Job search failed (${response.status}).`);
    }
  
    const json: JSearchResponse = await response.json();
  
    if (json.status !== 'OK' || !Array.isArray(json.data)) {
      return [];
    }
  
    return json.data.map((job): JobListing => {
      const locationParts = [job.job_city, job.job_country].filter(Boolean);
      let salary: string | undefined;
      if (job.job_min_salary || job.job_max_salary) {
        const currency = job.job_salary_currency || '';
        const period = job.job_salary_period ? `/${job.job_salary_period.toLowerCase()}` : '';
        if (job.job_min_salary && job.job_max_salary) {
          salary = `${currency} ${job.job_min_salary.toLocaleString()} - ${job.job_max_salary.toLocaleString()}${period}`;
        } else {
          const single = job.job_min_salary || job.job_max_salary;
          salary = `${currency} ${single?.toLocaleString()}${period}`;
        }
      }
  
      return {
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: job.job_is_remote ? 'Remote' : locationParts.join(', ') || 'Not specified',
        description: job.job_description,
        applyLink: job.job_apply_link,
        postedAt: job.job_posted_at_datetime_utc,
        employmentType: job.job_employment_type,
        salary,
        logo: job.employer_logo || undefined,
        isRemote: !!job.job_is_remote,
      };
    });
  }
  