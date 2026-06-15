import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Building2, Clock, ExternalLink, Search, Wifi } from 'lucide-react';
import { fetchJobs, JobListing, JobsApiError } from '../services/jobsApi';
import { getCountryISO } from '../lib/languages';
import { UserProfile } from '../types';

interface JobsTabProps {
  profile: UserProfile;
  language: string;
}

const jobsT: { [key: string]: { [lang: string]: string } } = {
  jobsTitle: {
    English: 'Job Opportunities',
    Uzbek: "Ish o'rinlari",
    Turkish: 'İş Fırsatları',
    Russian: 'Вакансии',
    Spanish: 'Ofertas de Empleo',
    French: "Offres d'Emploi",
    German: 'Stellenangebote',
  },
  jobsSubtitle: {
    English: 'Live listings matched to your career interests',
    Uzbek: "Sizning qiziqishlaringizga mos jonli ish e'lonlari",
    Turkish: 'Kariyer ilgi alanlarınıza uygun canlı ilanlar',
    Russian: 'Актуальные вакансии по вашим интересам',
    Spanish: 'Ofertas en vivo según tus intereses profesionales',
    French: "Offres en direct selon vos centres d'intérêt",
    German: 'Live-Stellenangebote passend zu Ihren Interessen',
  },
  careerLabel: {
    English: 'Role / Career',
    Uzbek: "Kasb / Yo'nalish",
    Turkish: 'Rol / Kariyer',
    Russian: 'Должность / Карьера',
    Spanish: 'Puesto / Carrera',
    French: 'Poste / Carrière',
    German: 'Rolle / Karriere',
  },
  countryLabel: {
    English: 'Country',
    Uzbek: 'Davlat',
    Turkish: 'Ülke',
    Russian: 'Страна',
    Spanish: 'País',
    French: 'Pays',
    German: 'Land',
  },
  searchButton: {
    English: 'Search Jobs',
    Uzbek: 'Qidirish',
    Turkish: 'İş Ara',
    Russian: 'Искать',
    Spanish: 'Buscar',
    French: 'Rechercher',
    German: 'Suchen',
  },
  remote: {
    English: 'Remote',
    Uzbek: 'Masofaviy',
    Turkish: 'Uzaktan',
    Russian: 'Удалённо',
    Spanish: 'Remoto',
    French: 'À distance',
    German: 'Remote',
  },
  applyNow: {
    English: 'Apply Now',
    Uzbek: 'Ariza topshirish',
    Turkish: 'Şimdi Başvur',
    Russian: 'Откликнуться',
    Spanish: 'Aplicar Ahora',
    French: 'Postuler',
    German: 'Jetzt Bewerben',
  },
  noJobsFound: {
    English: 'No jobs found. Try a different role or country.',
    Uzbek: "Hech qanday ish topilmadi. Boshqa kasb yoki davlatni sinab ko'ring.",
    Turkish: 'İş bulunamadı. Farklı bir rol veya ülke deneyin.',
    Russian: 'Вакансии не найдены. Попробуйте другую должность или страну.',
    Spanish: 'No se encontraron empleos. Prueba otro puesto o país.',
    French: 'Aucun emploi trouvé. Essayez un autre poste ou pays.',
    German: 'Keine Stellen gefunden. Versuchen Sie eine andere Rolle oder ein anderes Land.',
  },
  errorLoading: {
    English: 'Could not load jobs right now. Please try again.',
    Uzbek: "Hozir ish o'rinlarini yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Şu anda işler yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить вакансии. Попробуйте снова.',
    Spanish: 'No se pudieron cargar los empleos. Inténtalo de nuevo.',
    French: 'Impossible de charger les offres. Veuillez réessayer.',
    German: 'Stellen konnten nicht geladen werden. Bitte erneut versuchen.',
  },
  careerPlaceholder: {
    English: 'e.g. Software Engineer',
    Uzbek: 'm.u. Dasturchi',
    Turkish: 'ör. Yazılım Mühendisi',
    Russian: 'напр. Инженер-программист',
    Spanish: 'ej. Ingeniero de Software',
    French: 'ex. Ingénieur Logiciel',
    German: 'z.B. Softwareentwickler',
  },
};

function jt(key: string, language: string): string {
  const translations = jobsT[key];
  if (!translations) return key;
  return translations[language] || translations['English'] || key;
}

// Subset of countries with known ISO mappings for accurate JSearch filtering.
const COUNTRY_OPTIONS: { [key: string]: string } = {
  'Uzbekistan': 'uz', 'Turkey': 'tr', 'Russia': 'ru', 'United States': 'us',
  'United Kingdom': 'gb', 'Germany': 'de', 'France': 'fr', 'Spain': 'es',
  'Italy': 'it', 'Canada': 'ca', 'Australia': 'au', 'Japan': 'jp', 'China': 'cn',
  'India': 'in', 'Brazil': 'br', 'South Korea': 'kr', 'United Arab Emirates': 'ae',
  'Kazakhstan': 'kk', 'Kyrgyzstan': 'kg', 'Tajikistan': 'tj', 'Turkmenistan': 'tm',
  'Azerbaijan': 'az', 'Ukraine': 'ua', 'Poland': 'pl',
};

export default function JobsTab({ profile, language }: JobsTabProps) {
  const initialCareer = profile.interests?.[0] || '';
  const [career, setCareer] = useState(initialCareer);
  const [country, setCountry] = useState(profile.country || 'Global');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (searchCareer: string, searchCountry: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const countryISO = getCountryISO(searchCountry);
      const results = await fetchJobs(searchCareer, countryISO);
      setJobs(results);
    } catch (err) {
      if (err instanceof JobsApiError) {
        setError(err.message);
      } else {
        setError(jt('errorLoading', language));
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCareer) {
      runSearch(initialCareer, country);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(career, country);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{jt('jobsTitle', language)}</h1>
        <p className="text-gray-400">{jt('jobsSubtitle', language)}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm text-gray-400">{jt('careerLabel', language)}</label>
          <input
            type="text"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            placeholder={jt('careerPlaceholder', language)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00]"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm text-gray-400">{jt('countryLabel', language)}</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-[#ff4e00]"
          >
            <option value="Global">Global</option>
            {Object.keys(COUNTRY_OPTIONS).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          {jt('searchButton', language)}
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && hasSearched && jobs.length === 0 && (
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center text-gray-400">
          {jt('noJobsFound', language)}
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col gap-3 hover:border-[#ff4e00]/40 transition-colors">
              <div className="flex items-start gap-3">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#ff4e00]/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-[#ff4e00]" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-white leading-tight truncate">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span className="truncate">{job.company}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
                {job.isRemote && (
                  <span className="flex items-center gap-1 text-green-400">
                    <Wifi className="w-3.5 h-3.5" />
                    {jt('remote', language)}
                  </span>
                )}
                {job.employmentType && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {job.employmentType}
                  </span>
                )}
              </div>

              {job.salary && (
                <div className="text-sm font-medium text-green-400">{job.salary}</div>
              )}

              <p className="text-sm text-gray-400 line-clamp-3">{job.description}</p>

              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 text-[#ff4e00] rounded-xl text-sm font-medium transition-colors"
              >
                {jt('applyNow', language)}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
