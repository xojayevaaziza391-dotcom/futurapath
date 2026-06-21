import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Search } from 'lucide-react';
import { getRealEconomicData, EconomicData } from '../services/worldbank';
import { getSalaryData, SalaryData, SalaryApiError } from '../services/salaryApi';

interface EconomyTabProps {
  country: string;
  language: string;
}

const economyT: { [key: string]: { [lang: string]: string } } = {
  economyOverview: {
    English: 'Economy Overview',
    Uzbek: "Iqtisodiyot Ko'rinishi",
    Turkish: 'Ekonomiye Genel Bakış',
    Russian: 'Обзор экономики',
    Spanish: 'Resumen Económico',
    French: 'Aperçu Économique',
    German: 'Wirtschaftsüberblick',
  },
  realData: {
    English: 'Real Data (World Bank)',
    Uzbek: "Haqiqiy Ma'lumotlar (Jahon Banki)",
    Turkish: 'Gerçek Veriler (Dünya Bankası)',
    Russian: 'Реальные данные (Всемирный банк)',
    Spanish: 'Datos Reales (Banco Mundial)',
    French: 'Données Réelles (Banque Mondiale)',
    German: 'Echte Daten (Weltbank)',
  },
  gdpGrowth: {
    English: 'GDP Growth', Uzbek: "YaIM O'sishi", Turkish: 'GSYİH Büyümesi', Russian: 'Рост ВВП',
    Spanish: 'Crecimiento del PIB', French: 'Croissance du PIB', German: 'BIP-Wachstum',
  },
  unemployment: {
    English: 'Unemployment', Uzbek: 'Ishsizlik', Turkish: 'İşsizlik', Russian: 'Безработица',
    Spanish: 'Desempleo', French: 'Chômage', German: 'Arbeitslosigkeit',
  },
  inflation: {
    English: 'Inflation', Uzbek: 'Inflyatsiya', Turkish: 'Enflasyon', Russian: 'Инфляция',
    Spanish: 'Inflación', French: 'Inflation', German: 'Inflation',
  },
  gdpPerCapita: {
    English: 'GDP per Capita', Uzbek: 'Aholi Boshiga YaIM', Turkish: 'Kişi Başı GSYİH', Russian: 'ВВП на душу населения',
    Spanish: 'PIB per Cápita', French: 'PIB par Habitant', German: 'BIP pro Kopf',
  },
  careerImpact: {
    English: 'Career Impact', Uzbek: "Karyeraga Ta'siri", Turkish: 'Kariyer Etkisi', Russian: 'Влияние на карьеру',
    Spanish: 'Impacto en la Carrera', French: 'Impact sur la Carrière', German: 'Karriereauswirkungen',
  },
  careerImpactDesc: {
    English: "Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. Consider upskilling in data analysis and digital tools to stay competitive.",
    Uzbek: "{country} iqtisodiy ko'rsatkichlariga asoslanib, texnologiya, sog'liqni saqlash va moliya sohalari kuchli o'sish imkoniyatlarini ko'rsatmoqda. Raqobatbardosh bo'lish uchun ma'lumotlarni tahlil qilish va raqamli vositalarni o'rganing.",
    Turkish: "{country}'nin ekonomik göstergelerine göre teknoloji, sağlık ve finans sektörleri güçlü büyüme potansiyeli göstermektedir. Rekabetçi kalmak için veri analizi ve dijital araçlarda kendinizi geliştirin.",
    Russian: "На основе экономических показателей {country} такие сектора, как технологии, здравоохранение и финансы, демонстрируют значительный потенциал роста. Рассмотрите повышение квалификации в области анализа данных.",
    Spanish: "Basándonos en los indicadores económicos de {country}, sectores como tecnología, salud y finanzas muestran un fuerte potencial de crecimiento. Considere mejorar sus habilidades en análisis de datos.",
    French: "Sur la base des indicateurs économiques de {country}, des secteurs comme la technologie, la santé et la finance montrent un fort potentiel de croissance. Envisagez de vous perfectionner en analyse de données.",
    German: "Basierend auf den Wirtschaftsindikatoren von {country} zeigen Sektoren wie Technologie, Gesundheitswesen und Finanzen starkes Wachstumspotenzial. Erwägen Sie, Ihre Fähigkeiten in Datenanalyse zu erweitern.",
  },
  salaryTracker: {
    English: 'Salary Tracker', Uzbek: 'Maosh Kuzatuvchisi', Turkish: 'Maaş Takipçisi', Russian: 'Трекер зарплат',
    Spanish: 'Rastreador de Salarios', French: 'Suivi des Salaires', German: 'Gehalts-Tracker',
  },
  careerPlaceholder: {
    English: 'e.g. Software Engineer', Uzbek: 'm.u. Dasturchi', Turkish: 'ör. Yazılım Mühendisi', Russian: 'напр. Инженер-программист',
    Spanish: 'ej. Ingeniero de Software', French: 'ex. Ingénieur Logiciel', German: 'z.B. Softwareentwickler',
  },
  averageSalary: {
    English: 'Average Salary', Uzbek: "O'rtacha Maosh", Turkish: 'Ortalama Maaş', Russian: 'Средняя зарплата',
    Spanish: 'Salario Promedio', French: 'Salaire Moyen', German: 'Durchschnittsgehalt',
  },
  salaryRangeLabel: {
    English: 'Salary Range', Uzbek: 'Maosh Oralig\'i', Turkish: 'Maaş Aralığı', Russian: 'Диапазон зарплат',
    Spanish: 'Rango Salarial', French: 'Fourchette Salariale', German: 'Gehaltsspanne',
  },
  salaryHistogram: {
    English: 'Salary Distribution', Uzbek: 'Maosh Taqsimoti', Turkish: 'Maaş Dağılımı', Russian: 'Распределение зарплат',
    Spanish: 'Distribución Salarial', French: 'Distribution Salariale', German: 'Gehaltsverteilung',
  },
  jobsFound: {
    English: 'Jobs Found', Uzbek: 'Topilgan Ishlar', Turkish: 'Bulunan İşler', Russian: 'Найдено вакансий',
    Spanish: 'Empleos Encontrados', French: 'Emplois Trouvés', German: 'Gefundene Stellen',
  },
  searchSalary: {
    English: 'Search Salary', Uzbek: 'Maoshni Qidirish', Turkish: 'Maaş Ara', Russian: 'Найти зарплату',
    Spanish: 'Buscar Salario', French: 'Rechercher Salaire', German: 'Gehalt Suchen',
  },
  errorLoadingSalary: {
    English: 'Could not load salary data. Please try again.',
    Uzbek: "Maosh ma'lumotlarini yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Maaş verileri yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить данные о зарплате. Попробуйте снова.',
    Spanish: 'No se pudieron cargar los datos salariales. Inténtalo de nuevo.',
    French: 'Impossible de charger les données salariales. Veuillez réessayer.',
    German: 'Gehaltsdaten konnten nicht geladen werden. Bitte erneut versuchen.',
  },
  salaryFallbackWarning: {
    English: 'Salary data for {country} is not directly available. Showing {fallback} data as a reference baseline instead.',
    Uzbek: "{country} uchun maosh ma'lumotlari mavjud emas. O'rniga {fallback} ma'lumotlari ko'rsatilmoqda.",
    Turkish: '{country} için maaş verileri doğrudan mevcut değil. Bunun yerine {fallback} verileri referans olarak gösteriliyor.',
    Russian: 'Данные о зарплатах для {country} недоступны напрямую. Вместо этого показаны данные {fallback} как ориентир.',
    Spanish: 'Los datos salariales de {country} no están disponibles directamente. Mostrando datos de {fallback} como referencia.',
    French: 'Les données salariales pour {country} ne sont pas directement disponibles. Affichage des données de {fallback} à titre de référence.',
    German: 'Gehaltsdaten für {country} sind nicht direkt verfügbar. Es werden stattdessen {fallback}-Daten als Referenz angezeigt.',
  },
};

function et(key: string, language: string, replace?: { [k: string]: string }): string {
  const translations = economyT[key];
  if (!translations) return key;
  let text = translations[language] || translations['English'] || key;
  if (replace) {
    Object.entries(replace).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  }
  return text;
}

export default function EconomyTab({ country, language }: EconomyTabProps) {
  const [data, setData] = useState<EconomicData>({ country, gdpGrowth: null, unemploymentRate: null, youthUnemployment: null, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(true);

  const [career, setCareer] = useState('');
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRealEconomicData(country).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [country]);

  const handleSalarySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!career.trim()) return;
    setSalaryLoading(true);
    setSalaryError(null);
    try {
      const result = await getSalaryData(career.trim(), country);
      setSalaryData(result);
    } catch (err) {
      setSalaryError(err instanceof SalaryApiError ? err.message : et('errorLoadingSalary', language));
      setSalaryData(null);
    } finally {
      setSalaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{et('economyOverview', language)}</h1>
        <p className="text-gray-400">{country} — {et('realData', language)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{et('gdpGrowth', language)}</span>
          </div>
          <div className={`text-2xl font-bold ${(data.gdpGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.gdpGrowth?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{et('unemployment', language)}</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {data.unemploymentRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">{et('inflation', language)}</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {data.youthUnemployment?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#ff4e00]" />
          <span className="font-medium">{et('careerImpact', language)}</span>
        </div>
        <p className="text-gray-400 text-sm">
          {et('careerImpactDesc', language, { country })}
        </p>
      </div>

      {/* Salary Tracker */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#ff4e00]" />
          <span className="font-medium">{et('salaryTracker', language)}</span>
        </div>

        <form onSubmit={handleSalarySearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            placeholder={et('careerPlaceholder', language)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00]"
          />
          <button
            type="submit"
            disabled={salaryLoading}
            className="px-6 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {et('searchSalary', language)}
          </button>
        </form>

        {salaryLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!salaryLoading && salaryError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
            {salaryError}
          </div>
        )}

        {!salaryLoading && !salaryError && salaryData && (
          <div className="space-y-4">
            {salaryData.isFallback && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-300 text-xs flex items-start gap-2">
                <span>⚠️</span>
                <span>{et('salaryFallbackWarning', language, { country, fallback: salaryData.fallbackCountryUsed || 'United States' })}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{et('averageSalary', language)}</div>
                <div className="text-xl font-bold text-green-400">
                  {salaryData.currency} {salaryData.averageSalary.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{et('salaryRangeLabel', language)}</div>
                <div className="text-sm font-medium text-white">
                  {salaryData.currency} {salaryData.minSalary.toLocaleString()} – {salaryData.maxSalary.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{et('jobsFound', language)}</div>
                <div className="text-xl font-bold text-blue-400">{salaryData.jobCount.toLocaleString()}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-2">{et('salaryHistogram', language)}</div>
              <div className="flex items-end gap-1.5 h-24">
                {salaryData.histogram.map((bucket) => {
                  const max = Math.max(...salaryData.histogram.map(h => h.count));
                  const heightPct = max > 0 ? (bucket.count / max) * 100 : 0;
                  return (
                    <div key={bucket.range} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-[#ff4e00]/60 rounded-t-md transition-all min-h-[2px]"
                        style={{ height: `${heightPct}%` }}
                        title={`${salaryData.currency} ${parseInt(bucket.range).toLocaleString()}: ${bucket.count} jobs`}
                      />
                      <span className="text-[9px] text-gray-500 rotate-0">
                        {(parseInt(bucket.range) / 1000).toFixed(0)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
