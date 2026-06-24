import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Search, Database } from 'lucide-react';
import { getRealEconomicData, EconomicData } from '../services/worldbank';
import { getSalaryData, SalaryData, SalaryApiError } from '../services/salaryApi';

interface EconomyTabProps {
  country: string;
  language: string;
}

const economyT: { [key: string]: { [lang: string]: string } } = {
  economyOverview: {
    English: 'Economy Overview', Uzbek: "Iqtisodiyot Ko'rinishi", Turkish: 'Ekonomiye Genel Bakış',
    Russian: 'Обзор экономики', Spanish: 'Resumen Económico', French: 'Aperçu Économique',
    German: 'Wirtschaftsüberblick', Arabic: 'نظرة عامة على الاقتصاد', Chinese: '经济概览',
    Japanese: '経済概要', Korean: '경제 개요', Hindi: 'अर्थव्यवस्था अवलोकन',
    Portuguese: 'Visão Geral da Economia', Italian: 'Panoramica Economica', Polish: 'Przegląd Gospodarki',
    Ukrainian: 'Огляд економіки', Kazakh: 'Экономикаға шолу', Azerbaijani: 'İqtisadiyyata Ümumi Baxış',
    Persian: 'مروری بر اقتصاد', Indonesian: 'Ikhtisar Ekonomi', Dutch: 'Economisch Overzicht',
    Swedish: 'Ekonomisk Översikt',
  },
  realData: {
    English: 'Real Data (World Bank)', Uzbek: "Haqiqiy Ma'lumotlar (Jahon Banki)",
    Turkish: 'Gerçek Veriler (Dünya Bankası)', Russian: 'Реальные данные (Всемирный банк)',
    Spanish: 'Datos Reales (Banco Mundial)', French: 'Données Réelles (Banque Mondiale)',
    German: 'Echte Daten (Weltbank)', Arabic: 'بيانات حقيقية (البنك الدولي)',
    Chinese: '真实数据（世界银行）', Japanese: 'リアルデータ（世界銀行）',
    Korean: '실제 데이터 (세계은행)', Hindi: 'वास्तविक डेटा (विश्व बैंक)',
    Portuguese: 'Dados Reais (Banco Mundial)', Italian: 'Dati Reali (Banca Mondiale)',
    Polish: 'Rzeczywiste Dane (Bank Światowy)', Ukrainian: 'Реальні дані (Світовий банк)',
    Kazakh: 'Нақты деректер (Дүниежүзілік банк)', Azerbaijani: 'Həqiqi Məlumatlar (Dünya Bankı)',
    Persian: 'داده‌های واقعی (بانک جهانی)', Indonesian: 'Data Nyata (Bank Dunia)',
    Dutch: 'Echte Gegevens (Wereldbank)', Swedish: 'Verklig Data (Världsbanken)',
  },
  gdpGrowth: {
    English: 'GDP Growth', Uzbek: "YaIM O'sishi", Turkish: 'GSYİH Büyümesi', Russian: 'Рост ВВП',
    Spanish: 'Crecimiento del PIB', French: 'Croissance du PIB', German: 'BIP-Wachstum',
    Arabic: 'نمو الناتج المحلي الإجمالي', Chinese: 'GDP增长', Japanese: 'GDP成長率',
    Korean: 'GDP 성장', Hindi: 'जीडीपी वृद्धि', Portuguese: 'Crescimento do PIB',
    Italian: 'Crescita del PIL', Polish: 'Wzrost PKB', Ukrainian: 'Зростання ВВП',
    Kazakh: 'ЖІӨ өсімі', Azerbaijani: 'ÜDM Artımı', Persian: 'رشد تولید ناخالص داخلی',
    Indonesian: 'Pertumbuhan PDB', Dutch: 'BBP-groei', Swedish: 'BNP-tillväxt',
  },
  unemployment: {
    English: 'Unemployment', Uzbek: 'Ishsizlik', Turkish: 'İşsizlik', Russian: 'Безработица',
    Spanish: 'Desempleo', French: 'Chômage', German: 'Arbeitslosigkeit',
    Arabic: 'البطالة', Chinese: '失业率', Japanese: '失業率', Korean: '실업률',
    Hindi: 'बेरोजगारी', Portuguese: 'Desemprego', Italian: 'Disoccupazione',
    Polish: 'Bezrobocie', Ukrainian: 'Безробіття', Kazakh: 'Жұмыссыздық',
    Azerbaijani: 'İşsizlik', Persian: 'بیکاری', Indonesian: 'Pengangguran',
    Dutch: 'Werkloosheid', Swedish: 'Arbetslöshet',
  },
  inflation: {
    English: 'Inflation', Uzbek: 'Inflyatsiya', Turkish: 'Enflasyon', Russian: 'Инфляция',
    Spanish: 'Inflación', French: 'Inflation', German: 'Inflation',
    Arabic: 'التضخم', Chinese: '通货膨胀', Japanese: 'インフレ', Korean: '인플레이션',
    Hindi: 'मुद्रास्फीति', Portuguese: 'Inflação', Italian: 'Inflazione',
    Polish: 'Inflacja', Ukrainian: 'Інфляція', Kazakh: 'Инфляция',
    Azerbaijani: 'İnflyasiya', Persian: 'تورم', Indonesian: 'Inflasi',
    Dutch: 'Inflatie', Swedish: 'Inflation',
  },
  careerImpact: {
    English: 'Career Impact', Uzbek: "Karyeraga Ta'siri", Turkish: 'Kariyer Etkisi',
    Russian: 'Влияние на карьеру', Spanish: 'Impacto en la Carrera', French: 'Impact sur la Carrière',
    German: 'Karriereauswirkungen', Arabic: 'التأثير على المهنة', Chinese: '职业影响',
    Japanese: 'キャリアへの影響', Korean: '커리어 영향', Hindi: 'करियर प्रभाव',
    Portuguese: 'Impacto na Carreira', Italian: 'Impatto sulla Carriera', Polish: 'Wpływ na Karierę',
    Ukrainian: 'Вплив на кар\'єру', Kazakh: 'Мансапқа әсері', Azerbaijani: 'Karyeraya Təsir',
    Persian: 'تأثیر بر شغل', Indonesian: 'Dampak Karier', Dutch: 'Carrière-impact',
    Swedish: 'Karriärpåverkan',
  },
  careerImpactDesc: {
    English: "Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. Consider upskilling in data analysis and digital tools to stay competitive.",
    Uzbek: "{country} iqtisodiy ko'rsatkichlariga asoslanib, texnologiya, sog'liqni saqlash va moliya sohalari kuchli o'sish imkoniyatlarini ko'rsatmoqda.",
    Turkish: "{country}'nin ekonomik göstergelerine göre teknoloji, sağlık ve finans sektörleri güçlü büyüme potansiyeli göstermektedir.",
    Russian: "На основе экономических показателей {country} такие сектора, как технологии, здравоохранение и финансы, демонстрируют значительный потенциал роста.",
    Spanish: "Basándonos en los indicadores económicos de {country}, sectores como tecnología, salud y finanzas muestran un fuerte potencial de crecimiento.",
    French: "Sur la base des indicateurs économiques de {country}, des secteurs comme la technologie, la santé et la finance montrent un fort potentiel de croissance.",
    German: "Basierend auf den Wirtschaftsindikatoren von {country} zeigen Sektoren wie Technologie, Gesundheitswesen und Finanzen starkes Wachstumspotenzial.",
    Arabic: "بناءً على المؤشرات الاقتصادية لـ {country}، تُظهر قطاعات مثل التكنولوجيا والرعاية الصحية والمالية إمكانات نمو قوية.",
    Chinese: "根据{country}的经济指标，技术、医疗和金融等行业显示出强劲的增长潜力。",
    Japanese: "{country}の経済指標に基づき、テクノロジー、医療、金融などの分野が強い成長の可能性を示しています。",
    Korean: "{country}의 경제 지표를 바탕으로 기술, 의료, 금융 분야가 강한 성장 잠재력을 보이고 있습니다.",
    Hindi: "{country} के आर्थिक संकेतकों के आधार पर, प्रौद्योगिकी, स्वास्थ्य सेवा और वित्त जैसे क्षेत्र मजबूत विकास क्षमता दिखाते हैं।",
    Portuguese: "Com base nos indicadores econômicos de {country}, setores como tecnologia, saúde e finanças mostram forte potencial de crescimento.",
    Italian: "Sulla base degli indicatori economici di {country}, settori come tecnologia, sanità e finanza mostrano un forte potenziale di crescita.",
    Polish: "Na podstawie wskaźników gospodarczych {country}, sektory takie jak technologia, opieka zdrowotna i finanse wykazują silny potencjał wzrostu.",
    Ukrainian: "На основі економічних показників {country} такі сектори, як технології, охорона здоров'я та фінанси, демонструють значний потенціал зростання.",
    Kazakh: "{country} экономикалық көрсеткіштеріне сүйене отырып, технология, денсаулық сақтау және қаржы салалары күшті өсу мүмкіндіктерін көрсетеді.",
    Azerbaijani: "{country}-nin iqtisadi göstəricilərinə əsasən texnologiya, səhiyyə və maliyyə kimi sektorlar güclü böyümə potensialı göstərir.",
    Persian: "بر اساس شاخص‌های اقتصادی {country}، بخش‌هایی مانند فناوری، بهداشت و مالیه پتانسیل رشد قوی نشان می‌دهند.",
    Indonesian: "Berdasarkan indikator ekonomi {country}, sektor seperti teknologi, kesehatan, dan keuangan menunjukkan potensi pertumbuhan yang kuat.",
    Dutch: "Op basis van de economische indicatoren van {country} tonen sectoren als technologie, gezondheidszorg en financiën sterk groeipotentieel.",
    Swedish: "Baserat på {country}s ekonomiska indikatorer visar sektorer som teknik, hälsovård och finans stark tillväxtpotential.",
  },
  salaryTracker: {
    English: 'Salary Tracker', Uzbek: 'Maosh Kuzatuvchisi', Turkish: 'Maaş Takipçisi',
    Russian: 'Трекер зарплат', Spanish: 'Rastreador de Salarios', French: 'Suivi des Salaires',
    German: 'Gehalts-Tracker', Arabic: 'متتبع الرواتب', Chinese: '薪资追踪器',
    Japanese: '給与トラッカー', Korean: '급여 추적기', Hindi: 'वेतन ट्रैकर',
    Portuguese: 'Rastreador de Salários', Italian: 'Tracker Stipendi', Polish: 'Śledzenie Wynagrodzeń',
    Ukrainian: 'Трекер зарплат', Kazakh: 'Жалақы бақылаушысы', Azerbaijani: 'Maaş İzləyicisi',
    Persian: 'ردیاب حقوق', Indonesian: 'Pelacak Gaji', Dutch: 'Salaris Tracker',
    Swedish: 'Löne-tracker',
  },
  careerPlaceholder: {
    English: 'e.g. Software Engineer', Uzbek: 'm.u. Dasturchi', Turkish: 'ör. Yazılım Mühendisi',
    Russian: 'напр. Инженер-программист', Spanish: 'ej. Ingeniero de Software',
    French: 'ex. Ingénieur Logiciel', German: 'z.B. Softwareentwickler',
    Arabic: 'مثال: مهندس برمجيات', Chinese: '例如：软件工程师', Japanese: '例：ソフトウェアエンジニア',
    Korean: '예: 소프트웨어 엔지니어', Hindi: 'उदा. सॉफ्टवेयर इंजीनियर',
    Portuguese: 'ex. Engenheiro de Software', Italian: 'es. Ingegnere del Software',
    Polish: 'np. Inżynier Oprogramowania', Ukrainian: 'напр. Інженер-програміст',
    Kazakh: 'мыс. Бағдарламалық инженер', Azerbaijani: 'məs. Proqram Mühəndisi',
    Persian: 'مثال: مهندس نرم‌افزار', Indonesian: 'mis. Insinyur Perangkat Lunak',
    Dutch: 'bijv. Software Engineer', Swedish: 't.ex. Mjukvaruingenjör',
  },
  averageSalary: {
    English: 'Average Salary', Uzbek: "O'rtacha Maosh", Turkish: 'Ortalama Maaş',
    Russian: 'Средняя зарплата', Spanish: 'Salario Promedio', French: 'Salaire Moyen',
    German: 'Durchschnittsgehalt', Arabic: 'متوسط الراتب', Chinese: '平均薪资',
    Japanese: '平均給与', Korean: '평균 급여', Hindi: 'औसत वेतन',
    Portuguese: 'Salário Médio', Italian: 'Stipendio Medio', Polish: 'Średnie Wynagrodzenie',
    Ukrainian: 'Середня зарплата', Kazakh: 'Орташа жалақы', Azerbaijani: 'Orta Maaş',
    Persian: 'میانگین حقوق', Indonesian: 'Gaji Rata-rata', Dutch: 'Gemiddeld Salaris',
    Swedish: 'Genomsnittslön',
  },
  salaryRangeLabel: {
    English: 'Salary Range', Uzbek: "Maosh Oralig'i", Turkish: 'Maaş Aralığı',
    Russian: 'Диапазон зарплат', Spanish: 'Rango Salarial', French: 'Fourchette Salariale',
    German: 'Gehaltsspanne', Arabic: 'نطاق الراتب', Chinese: '薪资范围',
    Japanese: '給与範囲', Korean: '급여 범위', Hindi: 'वेतन सीमा',
    Portuguese: 'Faixa Salarial', Italian: 'Fascia Salariale', Polish: 'Przedział Wynagrodzeń',
    Ukrainian: 'Діапазон зарплат', Kazakh: 'Жалақы диапазоны', Azerbaijani: 'Maaş Diapazonu',
    Persian: 'محدوده حقوق', Indonesian: 'Rentang Gaji', Dutch: 'Salarisbereik',
    Swedish: 'Löneintervall',
  },
  salaryHistogram: {
    English: 'Salary Distribution', Uzbek: 'Maosh Taqsimoti', Turkish: 'Maaş Dağılımı',
    Russian: 'Распределение зарплат', Spanish: 'Distribución Salarial', French: 'Distribution Salariale',
    German: 'Gehaltsverteilung', Arabic: 'توزيع الرواتب', Chinese: '薪资分布',
    Japanese: '給与分布', Korean: '급여 분포', Hindi: 'वेतन वितरण',
    Portuguese: 'Distribuição Salarial', Italian: 'Distribuzione Stipendi', Polish: 'Rozkład Wynagrodzeń',
    Ukrainian: 'Розподіл зарплат', Kazakh: 'Жалақы бөлінісі', Azerbaijani: 'Maaş Paylanması',
    Persian: 'توزیع حقوق', Indonesian: 'Distribusi Gaji', Dutch: 'Salarisverdeling',
    Swedish: 'Lönefördelning',
  },
  jobsFound: {
    English: 'Jobs Found', Uzbek: 'Topilgan Ishlar', Turkish: 'Bulunan İşler',
    Russian: 'Найдено вакансий', Spanish: 'Empleos Encontrados', French: 'Emplois Trouvés',
    German: 'Gefundene Stellen', Arabic: 'الوظائف المتاحة', Chinese: '找到的工作',
    Japanese: '見つかった求人', Korean: '발견된 일자리', Hindi: 'मिली नौकरियां',
    Portuguese: 'Empregos Encontrados', Italian: 'Lavori Trovati', Polish: 'Znalezione Oferty',
    Ukrainian: 'Знайдено вакансій', Kazakh: 'Табылған жұмыстар', Azerbaijani: 'Tapılan İşlər',
    Persian: 'مشاغل یافت شده', Indonesian: 'Pekerjaan Ditemukan', Dutch: 'Gevonden Banen',
    Swedish: 'Hittade Jobb',
  },
  searchSalary: {
    English: 'Search Salary', Uzbek: 'Maoshni Qidirish', Turkish: 'Maaş Ara',
    Russian: 'Найти зарплату', Spanish: 'Buscar Salario', French: 'Rechercher Salaire',
    German: 'Gehalt Suchen', Arabic: 'البحث عن الراتب', Chinese: '搜索薪资',
    Japanese: '給与を検索', Korean: '급여 검색', Hindi: 'वेतन खोजें',
    Portuguese: 'Buscar Salário', Italian: 'Cerca Stipendio', Polish: 'Szukaj Wynagrodzenia',
    Ukrainian: 'Знайти зарплату', Kazakh: 'Жалақыны іздеу', Azerbaijani: 'Maaş Axtar',
    Persian: 'جستجوی حقوق', Indonesian: 'Cari Gaji', Dutch: 'Zoek Salaris',
    Swedish: 'Sök Lön',
  },
  dataSources: {
    English: 'Data from', Uzbek: 'Maʼlumot manbai', Turkish: 'Veri kaynağı',
    Russian: 'Данные из', Spanish: 'Datos de', French: 'Données de',
    German: 'Daten von', Arabic: 'بيانات من', Chinese: '数据来源',
    Japanese: 'データ元', Korean: '데이터 출처', Hindi: 'डेटा स्रोत',
    Portuguese: 'Dados de', Italian: 'Dati da', Polish: 'Dane z',
    Ukrainian: 'Дані з', Kazakh: 'Деректер', Azerbaijani: 'Məlumat mənbəyi',
    Persian: 'داده از', Indonesian: 'Data dari', Dutch: 'Gegevens van',
    Swedish: 'Data från',
  },
  errorLoadingSalary: {
    English: 'Could not load salary data. Please try again.',
    Uzbek: "Maosh ma'lumotlarini yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Maaş verileri yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить данные о зарплате. Попробуйте снова.',
    Spanish: 'No se pudieron cargar los datos salariales. Inténtalo de nuevo.',
    French: 'Impossible de charger les données salariales. Veuillez réessayer.',
    German: 'Gehaltsdaten konnten nicht geladen werden. Bitte erneut versuchen.',
    Arabic: 'تعذر تحميل بيانات الراتب. يرجى المحاولة مرة أخرى.',
    Chinese: '无法加载薪资数据，请重试。', Japanese: '給与データを読み込めませんでした。再試行してください。',
    Korean: '급여 데이터를 불러올 수 없습니다. 다시 시도해주세요.',
    Hindi: 'वेतन डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।',
    Portuguese: 'Não foi possível carregar dados salariais. Tente novamente.',
    Italian: 'Impossibile caricare i dati salariali. Riprova.',
    Polish: 'Nie można załadować danych o wynagrodzeniach. Spróbuj ponownie.',
    Ukrainian: 'Не вдалося завантажити дані про зарплату. Спробуйте ще раз.',
    Kazakh: 'Жалақы деректерін жүктеу мүмкін болмады. Қайталап көріңіз.',
    Azerbaijani: 'Maaş məlumatları yüklənə bilmədi. Yenidən cəhd edin.',
    Persian: 'بارگذاری داده‌های حقوق ممکن نشد. لطفاً دوباره تلاش کنید.',
    Indonesian: 'Tidak dapat memuat data gaji. Silakan coba lagi.',
    Dutch: 'Salarisgegevens konden niet worden geladen. Probeer het opnieuw.',
    Swedish: 'Kunde inte ladda lönedata. Försök igen.',
  },
  salaryFallbackWarning: {
    English: 'Salary data for {country} is not directly available. Showing {fallback} data as a reference baseline instead.',
    Uzbek: "{country} uchun maosh ma'lumotlari mavjud emas. O'rniga {fallback} ma'lumotlari ko'rsatilmoqda.",
    Turkish: '{country} için maaş verileri doğrudan mevcut değil. Bunun yerine {fallback} verileri referans olarak gösteriliyor.',
    Russian: 'Данные о зарплатах для {country} недоступны напрямую. Вместо этого показаны данные {fallback} как ориентир.',
    Spanish: 'Los datos salariales de {country} no están disponibles directamente. Mostrando datos de {fallback} como referencia.',
    French: 'Les données salariales pour {country} ne sont pas directement disponibles. Affichage des données de {fallback} à titre de référence.',
    German: 'Gehaltsdaten für {country} sind nicht direkt verfügbar. Es werden stattdessen {fallback}-Daten als Referenz angezeigt.',
    Arabic: 'بيانات الراتب لـ {country} غير متاحة مباشرة. يتم عرض بيانات {fallback} كمرجع بدلاً من ذلك.',
    Chinese: '{country}的薪资数据不直接可用。改为显示{fallback}数据作为参考基准。',
    Japanese: '{country}の給与データは直接利用できません。代わりに{fallback}のデータを参照として表示します。',
    Korean: '{country}의 급여 데이터를 직접 이용할 수 없습니다. 대신 {fallback} 데이터를 참조로 표시합니다.',
    Hindi: '{country} के लिए वेतन डेटा सीधे उपलब्ध नहीं है। इसके बजाय {fallback} डेटा संदर्भ के रूप में दिखाया जा रहा है।',
    Portuguese: 'Dados salariais para {country} não estão disponíveis diretamente. Mostrando dados de {fallback} como referência.',
    Italian: 'I dati salariali per {country} non sono disponibili direttamente. Vengono mostrati i dati di {fallback} come riferimento.',
    Polish: 'Dane o wynagrodzeniach dla {country} nie są bezpośrednio dostępne. Zamiast tego wyświetlane są dane {fallback} jako punkt odniesienia.',
    Ukrainian: 'Дані про зарплати для {country} недоступні безпосередньо. Замість цього показані дані {fallback} як орієнтир.',
    Kazakh: '{country} үшін жалақы деректері тікелей қол жетімді емес. Оның орнына {fallback} деректері анықтамалық ретінде көрсетіледі.',
    Azerbaijani: '{country} üçün maaş məlumatları birbaşa mövcud deyil. Bunun əvəzinə {fallback} məlumatları istinad kimi göstərilir.',
    Persian: 'داده‌های حقوق برای {country} مستقیماً در دسترس نیست. در عوض داده‌های {fallback} به عنوان مرجع نشان داده می‌شود.',
    Indonesian: 'Data gaji untuk {country} tidak tersedia secara langsung. Menampilkan data {fallback} sebagai referensi.',
    Dutch: 'Salarisgegevens voor {country} zijn niet direct beschikbaar. In plaats daarvan worden {fallback}-gegevens als referentie weergegeven.',
    Swedish: 'Lönedata för {country} är inte direkt tillgänglig. Visar {fallback}-data som referens istället.',
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
      if (!cancelled) { setData(result); setLoading(false); }
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
        <p className="text-gray-400 text-sm">{et('careerImpactDesc', language, { country })}</p>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
        {/* Header with sources badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#ff4e00]" />
            <span className="font-medium">{et('salaryTracker', language)}</span>
          </div>
          {/* Sources badge — shown only after a search */}
          {salaryData && salaryData.sources && salaryData.sources.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ff4e00]/10 border border-[#ff4e00]/20 rounded-full">
              <Database className="w-3 h-3 text-[#ff4e00]" />
              <span className="text-[10px] font-bold text-[#ff4e00] uppercase tracking-wide">
                {et('dataSources', language)}: {salaryData.sources.join(' + ')}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSalarySearch} className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={career} onChange={(e) => setCareer(e.target.value)}
            placeholder={et('careerPlaceholder', language)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[#ff4e00]" />
          <button type="submit" disabled={salaryLoading}
            className="px-6 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50">
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">{salaryError}</div>
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
                <div className="text-xl font-bold text-green-400">{salaryData.currency} {salaryData.averageSalary.toLocaleString()}</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">{et('salaryRangeLabel', language)}</div>
                <div className="text-sm font-medium text-white">{salaryData.currency} {salaryData.minSalary.toLocaleString()} – {salaryData.maxSalary.toLocaleString()}</div>
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
                      <div className="w-full bg-[#ff4e00]/60 rounded-t-md transition-all min-h-[2px]"
                        style={{ height: `${heightPct}%` }}
                        title={`${salaryData.currency} ${parseInt(bucket.range).toLocaleString()}: ${bucket.count} jobs`} />
                      <span className="text-[9px] text-gray-500">{(parseInt(bucket.range) / 1000).toFixed(0)}k</span>
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
