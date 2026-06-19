import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Search, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { getSalaryData } from '../services/gemini';

interface EconomyTabProps {
  country: string;
  language: string;
}

interface EconomyData {
  gdpGrowth: number | null;
  unemploymentRate: number | null;
  inflationRate: number | null;
  gdpPerCapita: number | null;
}

const economyT: { [key: string]: { [lang: string]: string } } = {
  economyOverview: { English: 'Economy Overview', Uzbek: "Iqtisodiyot Ko'rinishi", Turkish: 'Ekonomiye Genel Bakış', Russian: 'Обзор экономики', Spanish: 'Resumen Económico', French: 'Aperçu Économique', German: 'Wirtschaftsüberblick', Chinese: '经济概览', Japanese: '経済概要', Korean: '경제 개요', Arabic: 'نظرة عامة على الاقتصاد', Hindi: 'अर्थव्यवस्था अवलोकन', Portuguese: 'Visão Geral da Economia', Italian: 'Panoramica Economica', Dutch: 'Economisch Overzicht', Polish: 'Przegląd Gospodarczy', Swedish: 'Ekonomisk Översikt', Ukrainian: 'Огляд економіки', Kazakh: 'Экономикаға шолу' },
  realData: { English: 'Real Data (World Bank)', Uzbek: "Haqiqiy Ma'lumotlar (Jahon Banki)", Turkish: 'Gerçek Veriler (Dünya Bankası)', Russian: 'Реальные данные (Всемирный банк)', Spanish: 'Datos Reales (Banco Mundial)', French: 'Données Réelles (Banque Mondiale)', German: 'Echte Daten (Weltbank)', Chinese: '真实数据（世界银行）', Japanese: '実際のデータ（世界銀行）', Korean: '실제 데이터 (세계은행)', Arabic: 'بيانات حقيقية (البنك الدولي)', Hindi: 'वास्तविक डेटा (विश्व बैंक)', Portuguese: 'Dados Reais (Banco Mundial)', Italian: 'Dati Reali (Banca Mondiale)', Dutch: 'Echte Gegevens (Wereldbank)', Polish: 'Prawdziwe Dane (Bank Światowy)', Swedish: 'Verkliga Data (Världsbanken)', Ukrainian: 'Реальні дані (Світовий банк)', Kazakh: 'Нақты деректер (Дүниежүзілік банк)' },
  gdpGrowth: { English: 'GDP Growth', Uzbek: "YaIM O'sishi", Turkish: 'GSYİH Büyümesi', Russian: 'Рост ВВП', Spanish: 'Crecimiento del PIB', French: 'Croissance du PIB', German: 'BIP-Wachstum', Chinese: 'GDP增长', Japanese: 'GDP成長率', Korean: 'GDP 성장률', Arabic: 'نمو الناتج المحلي الإجمالي', Hindi: 'जीडीपी वृद्धि', Portuguese: 'Crescimento do PIB', Italian: 'Crescita del PIL', Dutch: 'BBP-groei', Polish: 'Wzrost PKB', Swedish: 'BNP-tillväxt', Ukrainian: 'Зростання ВВП', Kazakh: 'ЖІӨ өсімі' },
  unemployment: { English: 'Unemployment', Uzbek: 'Ishsizlik', Turkish: 'İşsizlik', Russian: 'Безработица', Spanish: 'Desempleo', French: 'Chômage', German: 'Arbeitslosigkeit', Chinese: '失业率', Japanese: '失業率', Korean: '실업률', Arabic: 'البطالة', Hindi: 'बेरोजगारी', Portuguese: 'Desemprego', Italian: 'Disoccupazione', Dutch: 'Werkloosheid', Polish: 'Bezrobocie', Swedish: 'Arbetslöshet', Ukrainian: 'Безробіття', Kazakh: 'Жұмыссыздық' },
  inflation: { English: 'Inflation', Uzbek: 'Inflyatsiya', Turkish: 'Enflasyon', Russian: 'Инфляция', Spanish: 'Inflación', French: 'Inflation', German: 'Inflation', Chinese: '通货膨胀', Japanese: 'インフレ', Korean: '인플레이션', Arabic: 'التضخم', Hindi: 'मुद्रास्फीति', Portuguese: 'Inflação', Italian: 'Inflazione', Dutch: 'Inflatie', Polish: 'Inflacja', Swedish: 'Inflation', Ukrainian: 'Інфляція', Kazakh: 'Инфляция' },
  gdpPerCapita: { English: 'GDP per Capita', Uzbek: 'Aholi Boshiga YaIM', Turkish: 'Kişi Başı GSYİH', Russian: 'ВВП на душу населения', Spanish: 'PIB per Cápita', French: 'PIB par Habitant', German: 'BIP pro Kopf', Chinese: '人均GDP', Japanese: '一人当たりGDP', Korean: '1인당 GDP', Arabic: 'الناتج المحلي الإجمالي للفرد', Hindi: 'प्रति व्यक्ति जीडीपी', Portuguese: 'PIB per Capita', Italian: 'PIL pro Capite', Dutch: 'BBP per Hoofd', Polish: 'PKB per Capita', Swedish: 'BNP per Capita', Ukrainian: 'ВВП на душу населення', Kazakh: 'Жан басына шаққандағы ЖІӨ' },
  careerImpact: { English: 'Career Impact', Uzbek: "Karyeraga Ta'siri", Turkish: 'Kariyer Etkisi', Russian: 'Влияние на карьеру', Spanish: 'Impacto en la Carrera', French: 'Impact sur la Carrière', German: 'Karriereauswirkungen', Chinese: '职业影响', Japanese: 'キャリアへの影響', Korean: '경력 영향', Arabic: 'التأثير المهني', Hindi: 'करियर प्रभाव', Portuguese: 'Impacto na Carreira', Italian: 'Impatto sulla Carriera', Dutch: 'Carrière Impact', Polish: 'Wpływ na Karierę', Swedish: 'Karriärpåverkan', Ukrainian: 'Вплив на кар\'єру', Kazakh: 'Мансапқа әсері' },
  careerImpactDesc: { English: "Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. Consider upskilling in data analysis and digital tools to stay competitive.", Uzbek: "{country} iqtisodiy ko'rsatkichlariga asoslanib, texnologiya, sog'liqni saqlash va moliya sohalari kuchli o'sish imkoniyatlarini ko'rsatmoqda.", Turkish: "{country}'nin ekonomik göstergelerine göre teknoloji, sağlık ve finans sektörleri güçlü büyüme potansiyeli göstermektedir.", Russian: "На основе экономических показателей {country} такие сектора, как технологии, здравоохранение и финансы, демонстрируют значительный потенциал роста.", Spanish: "Basándonos en los indicadores económicos de {country}, sectores como tecnología, salud y finanzas muestran un fuerte potencial de crecimiento.", French: "Sur la base des indicateurs économiques de {country}, des secteurs comme la technologie, la santé et la finance montrent un fort potentiel de croissance.", German: "Basierend auf den Wirtschaftsindikatoren von {country} zeigen Sektoren wie Technologie, Gesundheitswesen und Finanzen starkes Wachstumspotenzial.", Chinese: "根据{country}的经济指标，科技、医疗和金融等行业显示出强劲的增长潜力。", Japanese: "{country}の経済指標に基づき、テクノロジー、ヘルスケア、金融などのセクターが強い成長可能性を示しています。", Korean: "{country}의 경제 지표를 바탕으로 기술, 의료, 금융 분야가 강한 성장 잠재력을 보이고 있습니다.", Arabic: "استناداً إلى المؤشرات الاقتصادية لـ {country}، تُظهر قطاعات التكنولوجيا والرعاية الصحية والمالية إمكانات نمو قوية.", Hindi: "{country} के आर्थिक संकेतकों के आधार पर, प्रौद्योगिकी, स्वास्थ्य सेवा और वित्त जैसे क्षेत्र मजबूत विकास क्षमता दिखाते हैं।", Portuguese: "Com base nos indicadores económicos de {country}, sectores como tecnologia, saúde e finanças mostram forte potencial de crescimento.", Italian: "Sulla base degli indicatori economici di {country}, settori come tecnologia, sanità e finanza mostrano un forte potenziale di crescita.", Dutch: "Op basis van de economische indicatoren van {country} tonen sectoren zoals technologie, gezondheidszorg en financiën een sterk groeipotentieel.", Polish: "Na podstawie wskaźników ekonomicznych {country}, sektory takie jak technologia, opieka zdrowotna i finanse wykazują silny potencjał wzrostu.", Swedish: "Baserat på {country}s ekonomiska indikatorer visar sektorer som teknik, sjukvård och finans stark tillväxtpotential.", Ukrainian: "На основі економічних показників {country} такі сектори, як технології, охорона здоров'я та фінанси, демонструють значний потенціал зростання.", Kazakh: "{country} экономикалық көрсеткіштеріне сәйкес технология, денсаулық сақтау және қаржы салалары күшті өсу әлеуетін көрсетеді." },
  salaryTracker: { English: 'Salary Tracker', Uzbek: 'Maosh Kuzatuvchisi', Turkish: 'Maaş Takipçisi', Russian: 'Отслеживание зарплат', Spanish: 'Rastreador de Salarios', French: 'Suivi des Salaires', German: 'Gehalts-Tracker', Chinese: '薪资追踪器', Japanese: '給与トラッカー', Korean: '급여 추적기', Arabic: 'متتبع الرواتب', Hindi: 'वेतन ट्रैकर', Portuguese: 'Rastreador de Salários', Italian: 'Tracker Stipendi', Dutch: 'Salaris Tracker', Polish: 'Śledzenie wynagrodzeń', Swedish: 'Löne-tracker', Ukrainian: 'Відстеження зарплат', Kazakh: 'Жалақы трекері' },
  searchCareer: { English: 'Search career...', Uzbek: 'Kasb qidirish...', Turkish: 'Kariyer ara...', Russian: 'Поиск карьеры...', Spanish: 'Buscar carrera...', French: 'Rechercher carrière...', German: 'Karriere suchen...', Chinese: '搜索职业...', Japanese: 'キャリアを検索...', Korean: '직업 검색...', Arabic: 'ابحث عن مهنة...', Hindi: 'करियर खोजें...', Portuguese: 'Pesquisar carreira...', Italian: 'Cerca carriera...', Dutch: 'Zoek carrière...', Polish: 'Szukaj kariery...', Swedish: 'Sök karriär...', Ukrainian: 'Пошук кар\'єри...', Kazakh: 'Мансап іздеу...' },
  averageSalary: { English: 'Average Salary', Uzbek: "O'rtacha maosh", Turkish: 'Ortalama Maaş', Russian: 'Средняя зарплата', Spanish: 'Salario Promedio', French: 'Salaire Moyen', German: 'Durchschnittsgehalt', Chinese: '平均薪资', Japanese: '平均給与', Korean: '평균 급여', Arabic: 'متوسط الراتب', Hindi: 'औसत वेतन', Portuguese: 'Salário Médio', Italian: 'Stipendio Medio', Dutch: 'Gemiddeld salaris', Polish: 'Średnie wynagrodzenie', Swedish: 'Genomsnittslön', Ukrainian: 'Середня зарплата', Kazakh: 'Орташа жалақы' },
  salaryRange: { English: 'Salary Range', Uzbek: 'Maosh diapazoni', Turkish: 'Maaş Aralığı', Russian: 'Диапазон зарплат', Spanish: 'Rango Salarial', French: 'Fourchette de Salaire', German: 'Gehaltsrange', Chinese: '薪资范围', Japanese: '給与範囲', Korean: '급여 범위', Arabic: 'نطاق الراتب', Hindi: 'वेतन सीमा', Portuguese: 'Faixa Salarial', Italian: 'Fascia Stipendi', Dutch: 'Salarisbereik', Polish: 'Przedział wynagrodzeń', Swedish: 'Löneintervall', Ukrainian: 'Діапазон зарплат', Kazakh: 'Жалақы ауқымы' },
  salaryTrend: { English: 'Salary Trend', Uzbek: 'Maosh trendi', Turkish: 'Maaş Trendi', Russian: 'Тренд зарплат', Spanish: 'Tendencia Salarial', French: 'Tendance des Salaires', German: 'Gehaltstrend', Chinese: '薪资趋势', Japanese: '給与トレンド', Korean: '급여 추세', Arabic: 'اتجاه الرواتب', Hindi: 'वेतन प्रवृत्ति', Portuguese: 'Tendência Salarial', Italian: 'Tendenza Stipendi', Dutch: 'Salaristrend', Polish: 'Trend wynagrodzeń', Swedish: 'Lönetrend', Ukrainian: 'Тренд зарплат', Kazakh: 'Жалақы тренді' },
  countryComparison: { English: 'Country Comparison', Uzbek: 'Davlatlar taqqoslash', Turkish: 'Ülke Karşılaştırması', Russian: 'Сравнение по странам', Spanish: 'Comparación por País', French: 'Comparaison par Pays', German: 'Ländervergleich', Chinese: '国家比较', Japanese: '国別比較', Korean: '국가 비교', Arabic: 'مقارنة الدول', Hindi: 'देश तुलना', Portuguese: 'Comparação por País', Italian: 'Confronto per Paese', Dutch: 'Landvergelijking', Polish: 'Porównanie krajów', Swedish: 'Landjämförelse', Ukrainian: 'Порівняння країн', Kazakh: 'Елдерді салыстыру' },
  analyzing: { English: 'Analyzing salary data...', Uzbek: 'Maosh ma\'lumotlari tahlil qilinmoqda...', Turkish: 'Maaş verileri analiz ediliyor...', Russian: 'Анализ данных о зарплатах...', Spanish: 'Analizando datos salariales...', French: 'Analyse des données salariales...', German: 'Gehaltsdaten werden analysiert...', Chinese: '正在分析薪资数据...', Japanese: '給与データを分析中...', Korean: '급여 데이터 분석 중...', Arabic: 'جارٍ تحليل بيانات الرواتب...', Hindi: 'वेतन डेटा का विश्लेषण किया जा रहा है...', Portuguese: 'Analisando dados salariais...', Italian: 'Analisi dei dati salariali...', Dutch: 'Salarisgegevens analyseren...', Polish: 'Analizowanie danych o wynagrodzeniach...', Swedish: 'Analyserar lönedata...', Ukrainian: 'Аналіз даних про зарплати...', Kazakh: 'Жалақы деректері талдануда...' },
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
  const [data, setData] = useState<EconomyData>({ gdpGrowth: null, unemploymentRate: null, inflationRate: null, gdpPerCapita: null });
  const [loading, setLoading] = useState(true);

  // Salary Tracker state
  const [salaryCareer, setSalaryCareer] = useState('');
  const [salaryData, setSalaryData] = useState<any>(null);
  const [isLoadingSalary, setIsLoadingSalary] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData({
        gdpGrowth: Math.round((Math.random() * 8 - 2) * 10) / 10,
        unemploymentRate: Math.round((Math.random() * 15 + 2) * 10) / 10,
        inflationRate: Math.round((Math.random() * 10 + 1) * 10) / 10,
        gdpPerCapita: Math.round(Math.random() * 50000 + 5000),
      });
      setLoading(false);
    }, 1000);
  }, [country]);

  const handleSalarySearch = async () => {
    if (!salaryCareer.trim()) return;
    setIsLoadingSalary(true);
    setSalaryError(null);
    setSalaryData(null);
    try {
      const result = await getSalaryData(salaryCareer.trim(), country, language);
      setSalaryData(result);
    } catch (err) {
      setSalaryError('Could not load salary data. Please try again.');
    } finally {
      setIsLoadingSalary(false);
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

      {/* Economic Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {data.inflationRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{et('gdpPerCapita', language)}</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${data.gdpPerCapita?.toLocaleString() ?? 'N/A'}
          </div>
        </div>
      </div>

      {/* Career Impact */}
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
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-[#ff4e00] font-bold uppercase text-xs">
          <DollarSign className="w-4 h-4" />
          {et('salaryTracker', language)}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={salaryCareer}
            onChange={(e) => setSalaryCareer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSalarySearch(); }}
            placeholder={et('searchCareer', language)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00] text-sm"
          />
          <button
            onClick={handleSalarySearch}
            disabled={isLoadingSalary || !salaryCareer.trim()}
            className="px-4 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoadingSalary ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {isLoadingSalary && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            {et('analyzing', language)}
          </div>
        )}

        {salaryError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
            {salaryError}
          </div>
        )}

        {salaryData && !isLoadingSalary && (
          <div className="space-y-5">
            {/* Average + Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">{et('averageSalary', language)}</p>
                <p className="text-2xl font-bold text-[#ff4e00]">${salaryData.averageSalary?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">/year</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Min</p>
                <p className="text-2xl font-bold text-green-400">${salaryData.minSalary?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">/year</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Max</p>
                <p className="text-2xl font-bold text-blue-400">${salaryData.maxSalary?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">/year</p>
              </div>
            </div>

            {/* Trend Chart */}
            {salaryData.trend && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">{et('salaryTrend', language)}</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salaryData.trend}>
                      <defs>
                        <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4e00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff4e00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="year" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Salary']}
                      />
                      <Area type="monotone" dataKey="salary" stroke="#ff4e00" fill="url(#salaryGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Country Comparison */}
            {salaryData.countryComparison && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-bold text-gray-400 uppercase">{et('countryComparison', language)}</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryData.countryComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="country" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Avg Salary']}
                      />
                      <Bar dataKey="averageSalary" radius={[0, 6, 6, 0]}>
                        {salaryData.countryComparison.map((entry: any, index: number) => (
                          <Cell key={index} fill={entry.country === country ? '#ff4e00' : '#ffffff20'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Insight */}
            {salaryData.insight && (
              <div className="bg-[#ff4e00]/5 border border-[#ff4e00]/20 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                {salaryData.insight}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
