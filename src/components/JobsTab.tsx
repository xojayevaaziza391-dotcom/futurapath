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
    English: 'Job Opportunities', Uzbek: "Ish o'rinlari", Turkish: 'İş Fırsatları',
    Russian: 'Вакансии', Spanish: 'Ofertas de Empleo', French: "Offres d'Emploi",
    German: 'Stellenangebote', Arabic: 'فرص العمل', Chinese: '工作机会',
    Japanese: '求人情報', Korean: '취업 기회', Hindi: 'नौकरी के अवसर',
    Portuguese: 'Oportunidades de Emprego', Italian: 'Opportunità di Lavoro',
    Polish: 'Oferty Pracy', Ukrainian: 'Вакансії', Kazakh: 'Жұмыс мүмкіндіктері',
    Azerbaijani: 'İş İmkanları', Persian: 'فرصت‌های شغلی', Indonesian: 'Peluang Kerja',
    Dutch: 'Werkkansen', Swedish: 'Jobbmöjligheter',
  },
  jobsSubtitle: {
    English: 'Live listings matched to your career interests',
    Uzbek: "Sizning qiziqishlaringizga mos jonli ish e'lonlari",
    Turkish: 'Kariyer ilgi alanlarınıza uygun canlı ilanlar',
    Russian: 'Актуальные вакансии по вашим интересам',
    Spanish: 'Ofertas en vivo según tus intereses profesionales',
    French: "Offres en direct selon vos centres d'intérêt",
    German: 'Live-Stellenangebote passend zu Ihren Interessen',
    Arabic: 'قوائم حية تتطابق مع اهتماماتك المهنية',
    Chinese: '与您职业兴趣匹配的实时职位列表',
    Japanese: 'あなたのキャリアに合ったリアルタイム求人',
    Korean: '당신의 커리어 관심사에 맞는 실시간 채용 공고',
    Hindi: 'आपके करियर हितों से मेल खाती लाइव लिस्टिंग',
    Portuguese: 'Listagens ao vivo correspondentes aos seus interesses profissionais',
    Italian: 'Annunci in tempo reale corrispondenti ai tuoi interessi di carriera',
    Polish: 'Oferty na żywo dopasowane do Twoich zainteresowań zawodowych',
    Ukrainian: 'Актуальні вакансії відповідно до ваших інтересів',
    Kazakh: 'Сіздің мансап қызығушылықтарыңызға сәйкес тікелей хабарландырулар',
    Azerbaijani: 'Karyera maraqlarınıza uyğun canlı elanlar',
    Persian: 'فهرست‌های زنده منطبق با علایق شغلی شما',
    Indonesian: 'Daftar langsung yang sesuai dengan minat karier Anda',
    Dutch: 'Live vacatures die overeenkomen met uw carrièrebelangen',
    Swedish: 'Livelistningar matchade till dina karriärintressen',
  },
  careerLabel: {
    English: 'Role / Career', Uzbek: "Kasb / Yo'nalish", Turkish: 'Rol / Kariyer',
    Russian: 'Должность / Карьера', Spanish: 'Puesto / Carrera', French: 'Poste / Carrière',
    German: 'Rolle / Karriere', Arabic: 'الدور / المهنة', Chinese: '职位 / 职业',
    Japanese: '役職 / キャリア', Korean: '역할 / 커리어', Hindi: 'भूमिका / करियर',
    Portuguese: 'Cargo / Carreira', Italian: 'Ruolo / Carriera', Polish: 'Rola / Kariera',
    Ukrainian: 'Посада / Кар\'єра', Kazakh: 'Рөл / Мансап', Azerbaijani: 'Rol / Karyera',
    Persian: 'نقش / شغل', Indonesian: 'Peran / Karier', Dutch: 'Rol / Carrière',
    Swedish: 'Roll / Karriär',
  },
  countryLabel: {
    English: 'Country', Uzbek: 'Davlat', Turkish: 'Ülke', Russian: 'Страна',
    Spanish: 'País', French: 'Pays', German: 'Land', Arabic: 'الدولة',
    Chinese: '国家', Japanese: '国', Korean: '국가', Hindi: 'देश',
    Portuguese: 'País', Italian: 'Paese', Polish: 'Kraj', Ukrainian: 'Країна',
    Kazakh: 'Ел', Azerbaijani: 'Ölkə', Persian: 'کشور', Indonesian: 'Negara',
    Dutch: 'Land', Swedish: 'Land',
  },
  searchButton: {
    English: 'Search Jobs', Uzbek: 'Qidirish', Turkish: 'İş Ara', Russian: 'Искать',
    Spanish: 'Buscar', French: 'Rechercher', German: 'Suchen', Arabic: 'البحث عن وظائف',
    Chinese: '搜索工作', Japanese: '仕事を検索', Korean: '일자리 검색', Hindi: 'नौकरी खोजें',
    Portuguese: 'Buscar Empregos', Italian: 'Cerca Lavoro', Polish: 'Szukaj Pracy',
    Ukrainian: 'Шукати роботу', Kazakh: 'Жұмыс іздеу', Azerbaijani: 'İş Axtar',
    Persian: 'جستجوی شغل', Indonesian: 'Cari Pekerjaan', Dutch: 'Zoek Vacatures',
    Swedish: 'Sök Jobb',
  },
  remote: {
    English: 'Remote', Uzbek: 'Masofaviy', Turkish: 'Uzaktan', Russian: 'Удалённо',
    Spanish: 'Remoto', French: 'À distance', German: 'Remote', Arabic: 'عن بُعد',
    Chinese: '远程', Japanese: 'リモート', Korean: '원격', Hindi: 'दूरस्थ',
    Portuguese: 'Remoto', Italian: 'Remoto', Polish: 'Zdalnie', Ukrainian: 'Віддалено',
    Kazakh: 'Қашықтан', Azerbaijani: 'Uzaqdan', Persian: 'از راه دور',
    Indonesian: 'Jarak Jauh', Dutch: 'Op afstand', Swedish: 'Distans',
  },
  applyNow: {
    English: 'Apply Now', Uzbek: 'Ariza topshirish', Turkish: 'Şimdi Başvur',
    Russian: 'Откликнуться', Spanish: 'Aplicar Ahora', French: 'Postuler',
    German: 'Jetzt Bewerben', Arabic: 'تقدم الآن', Chinese: '立即申请',
    Japanese: '今すぐ応募', Korean: '지금 지원하기', Hindi: 'अभी आवेदन करें',
    Portuguese: 'Candidatar Agora', Italian: 'Candidati Ora', Polish: 'Aplikuj Teraz',
    Ukrainian: 'Подати заявку', Kazakh: 'Қазір өтініш беру', Azerbaijani: 'İndi Müraciət Et',
    Persian: 'همین حالا درخواست دهید', Indonesian: 'Lamar Sekarang', Dutch: 'Nu Solliciteren',
    Swedish: 'Ansök Nu',
  },
  noJobsFound: {
    English: 'No jobs found. Try a different role or country.',
    Uzbek: "Hech qanday ish topilmadi. Boshqa kasb yoki davlatni sinab ko'ring.",
    Turkish: 'İş bulunamadı. Farklı bir rol veya ülke deneyin.',
    Russian: 'Вакансии не найдены. Попробуйте другую должность или страну.',
    Spanish: 'No se encontraron empleos. Prueba otro puesto o país.',
    French: 'Aucun emploi trouvé. Essayez un autre poste ou pays.',
    German: 'Keine Stellen gefunden. Versuchen Sie eine andere Rolle oder ein anderes Land.',
    Arabic: 'لم يتم العثور على وظائف. جرب دوراً أو بلداً مختلفاً.',
    Chinese: '未找到工作。请尝试不同的职位或国家。',
    Japanese: '求人が見つかりません。別の役職や国をお試しください。',
    Korean: '일자리를 찾을 수 없습니다. 다른 역할이나 국가를 시도해보세요.',
    Hindi: 'कोई नौकरी नहीं मिली। कोई अलग भूमिका या देश आज़माएं।',
    Portuguese: 'Nenhum emprego encontrado. Tente um cargo ou país diferente.',
    Italian: 'Nessun lavoro trovato. Prova un ruolo o paese diverso.',
    Polish: 'Nie znaleziono ofert. Spróbuj innej roli lub kraju.',
    Ukrainian: 'Вакансії не знайдено. Спробуйте іншу посаду або країну.',
    Kazakh: 'Жұмыс табылмады. Басқа рөл немесе елді көріңіз.',
    Azerbaijani: 'İş tapılmadı. Fərqli bir rol və ya ölkə sınayın.',
    Persian: 'کاری یافت نشد. نقش یا کشور دیگری را امتحان کنید.',
    Indonesian: 'Tidak ada pekerjaan ditemukan. Coba peran atau negara yang berbeda.',
    Dutch: 'Geen vacatures gevonden. Probeer een andere rol of land.',
    Swedish: 'Inga jobb hittades. Försök med en annan roll eller land.',
  },
  errorLoading: {
    English: 'Could not load jobs right now. Please try again.',
    Uzbek: "Hozir ish o'rinlarini yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Şu anda işler yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить вакансии. Попробуйте снова.',
    Spanish: 'No se pudieron cargar los empleos. Inténtalo de nuevo.',
    French: 'Impossible de charger les offres. Veuillez réessayer.',
    German: 'Stellen konnten nicht geladen werden. Bitte erneut versuchen.',
    Arabic: 'تعذر تحميل الوظائف الآن. يرجى المحاولة مرة أخرى.',
    Chinese: '目前无法加载工作，请重试。',
    Japanese: '現在求人を読み込めませんでした。再試行してください。',
    Korean: '현재 일자리를 불러올 수 없습니다. 다시 시도해주세요.',
    Hindi: 'अभी नौकरियां लोड नहीं हो सकीं। कृपया पुनः प्रयास करें।',
    Portuguese: 'Não foi possível carregar empregos agora. Tente novamente.',
    Italian: 'Impossibile caricare i lavori ora. Riprova.',
    Polish: 'Nie można teraz załadować ofert. Spróbuj ponownie.',
    Ukrainian: 'Не вдалося завантажити вакансії. Спробуйте ще раз.',
    Kazakh: 'Қазір жұмыстарды жүктеу мүмкін болмады. Қайталап көріңіз.',
    Azerbaijani: 'İşlər hazırda yüklənə bilmədi. Yenidən cəhd edin.',
    Persian: 'در حال حاضر نمی‌توان مشاغل را بارگذاری کرد. لطفاً دوباره تلاش کنید.',
    Indonesian: 'Tidak dapat memuat pekerjaan sekarang. Silakan coba lagi.',
    Dutch: 'Kan vacatures nu niet laden. Probeer het opnieuw.',
    Swedish: 'Kunde inte ladda jobb just nu. Försök igen.',
  },
  careerPlaceholder: {
    English: 'e.g. Software Engineer', Uzbek: 'm.u. Dasturchi', Turkish: 'ör. Yazılım Mühendisi',
    Russian: 'напр. Инженер-программист', Spanish: 'ej. Ingeniero de Software',
    French: 'ex. Ingénieur Logiciel', German: 'z.B. Softwareentwickler',
    Arabic: 'مثال: مهندس برمجيات', Chinese: '例如：软件工程师',
    Japanese: '例：ソフトウェアエンジニア', Korean: '예: 소프트웨어 엔지니어',
    Hindi: 'उदा. सॉफ्टवेयर इंजीनियर', Portuguese: 'ex. Engenheiro de Software',
    Italian: 'es. Ingegnere del Software', Polish: 'np. Inżynier Oprogramowania',
    Ukrainian: 'напр. Інженер-програміст', Kazakh: 'мыс. Бағдарламалық инженер',
    Azerbaijani: 'məs. Proqram Mühəndisi', Persian: 'مثال: مهندس نرم‌افزار',
    Indonesian: 'mis. Insinyur Perangkat Lunak', Dutch: 'bijv. Software Engineer',
    Swedish: 't.ex. Mjukvaruingenjör',
  },
};

function jt(key: string, language: string): string {
  const translations = jobsT[key];
  if (!translations) return key;
  return translations[language] || translations['English'] || key;
}

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
      setError(err instanceof JobsApiError ? err.message : jt('errorLoading', language));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCareer) runSearch(initialCareer, country);
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
          <input type="text" value={career} onChange={(e) => setCareer(e.target.value)}
            placeholder={jt('careerPlaceholder', language)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00]" />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-sm text-gray-400">{jt('countryLabel', language)}</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-[#ff4e00]">
            <option value="Global">Global</option>
            {Object.keys(COUNTRY_OPTIONS).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300 text-sm">{error}</div>
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
              {job.salary && <div className="text-sm font-medium text-green-400">{job.salary}</div>}
              <p className="text-sm text-gray-400 line-clamp-3">{job.description}</p>
              <a href={job.applyLink} target="_blank" rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 text-[#ff4e00] rounded-xl text-sm font-medium transition-colors">
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