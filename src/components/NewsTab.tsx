import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Briefcase, Cpu, RefreshCw, Clock } from 'lucide-react';
import { fetchAllNews, fetchCareerNews, fetchTechNews, NewsArticle, NewsApiError } from '../services/newsApi';

interface NewsTabProps {
  language: string;
}

const newsT: { [key: string]: { [lang: string]: string } } = {
  newsTitle: {
    English: 'Career & Tech News', Uzbek: "Karyera va texnologiya yangiliklari",
    Turkish: 'Kariyer & Teknoloji Haberleri', Russian: 'Карьера и технологии: новости',
    Spanish: 'Noticias de Carrera y Tecnología', French: 'Actualités Carrière & Tech',
    German: 'Karriere & Tech Nachrichten', Arabic: 'أخبار المهنة والتكنولوجيا',
    Chinese: '职业与科技新闻', Japanese: 'キャリア＆テクニュース',
    Korean: '커리어 & 기술 뉴스', Hindi: 'करियर और टेक समाचार',
    Portuguese: 'Notícias de Carreira & Tech', Italian: 'Notizie Carriera & Tech',
    Polish: 'Wiadomości Kariery i Tech', Ukrainian: "Кар'єра та технології: новини",
    Kazakh: 'Мансап және технологиялар жаңалықтары', Azerbaijani: 'Karyera və Texnologiya Xəbərləri',
    Persian: 'اخبار شغلی و فناوری', Indonesian: 'Berita Karier & Teknologi',
    Dutch: 'Carrière & Tech Nieuws', Swedish: 'Karriär & Tech Nyheter',
  },
  newsSubtitle: {
    English: 'Stay ahead with the latest job market and AI trends',
    Uzbek: "Ish bozori va AI tendensiyalaridan xabardor bo'ling",
    Turkish: 'En son iş piyasası ve yapay zeka trendleriyle öne geçin',
    Russian: 'Будьте в курсе последних тенденций рынка труда и ИИ',
    Spanish: 'Mantente al día con las últimas tendencias del mercado laboral e IA',
    French: "Restez en avance avec les dernières tendances du marché du travail et de l'IA",
    German: 'Bleiben Sie mit den neuesten Arbeitsmarkt- und KI-Trends vorne',
    Arabic: 'ابق في المقدمة مع أحدث اتجاهات سوق العمل والذكاء الاصطناعي',
    Chinese: '紧跟最新就业市场和AI趋势', Japanese: '最新の雇用市場とAIトレンドを先取り',
    Korean: '최신 취업 시장 및 AI 트렌드를 앞서가세요', Hindi: 'नवीनतम नौकरी बाजार और AI रुझानों के साथ आगे रहें',
    Portuguese: 'Fique à frente com as últimas tendências do mercado de trabalho e IA',
    Italian: 'Rimani aggiornato con le ultime tendenze del mercato del lavoro e AI',
    Polish: 'Bądź na bieżąco z najnowszymi trendami rynku pracy i AI',
    Ukrainian: 'Будьте попереду з останніми тенденціями ринку праці та ШІ',
    Kazakh: 'Еңбек нарығы мен AI үрдістерінен хабардар болыңыз',
    Azerbaijani: 'Əmək bazarı və AI trendlərindən öndə olun',
    Persian: 'با آخرین روندهای بازار کار و هوش مصنوعی جلوتر باشید',
    Indonesian: 'Tetap terdepan dengan tren pasar kerja dan AI terbaru',
    Dutch: 'Blijf voorop met de laatste arbeidsmarkt- en AI-trends',
    Swedish: 'Håll dig steget före med de senaste arbetsmarknads- och AI-trenderna',
  },
  all: {
    English: 'All', Uzbek: 'Barchasi', Turkish: 'Tümü', Russian: 'Все',
    Spanish: 'Todo', French: 'Tout', German: 'Alle', Arabic: 'الكل',
    Chinese: '全部', Japanese: 'すべて', Korean: '전체', Hindi: 'सभी',
    Portuguese: 'Todos', Italian: 'Tutti', Polish: 'Wszystkie', Ukrainian: 'Всі',
    Kazakh: 'Барлығы', Azerbaijani: 'Hamısı', Persian: 'همه', Indonesian: 'Semua',
    Dutch: 'Alle', Swedish: 'Alla',
  },
  career: {
    English: 'Career', Uzbek: 'Karyera', Turkish: 'Kariyer', Russian: 'Карьера',
    Spanish: 'Carrera', French: 'Carrière', German: 'Karriere', Arabic: 'المهنة',
    Chinese: '职业', Japanese: 'キャリア', Korean: '커리어', Hindi: 'करियर',
    Portuguese: 'Carreira', Italian: 'Carriera', Polish: 'Kariera', Ukrainian: "Кар'єра",
    Kazakh: 'Мансап', Azerbaijani: 'Karyera', Persian: 'شغل', Indonesian: 'Karier',
    Dutch: 'Carrière', Swedish: 'Karriär',
  },
  tech: {
    English: 'Tech & AI', Uzbek: "Texnologiya va AI", Turkish: 'Teknoloji & AI',
    Russian: 'Технологии и ИИ', Spanish: 'Tecnología e IA', French: 'Tech & IA',
    German: 'Tech & KI', Arabic: 'التقنية والذكاء الاصطناعي', Chinese: '科技与AI',
    Japanese: 'テクノロジー＆AI', Korean: '기술 & AI', Hindi: 'टेक और AI',
    Portuguese: 'Tecnologia & IA', Italian: 'Tech & AI', Polish: 'Tech i AI',
    Ukrainian: 'Технології та ШІ', Kazakh: 'Технология және AI', Azerbaijani: 'Tech & AI',
    Persian: 'فناوری و هوش مصنوعی', Indonesian: 'Teknologi & AI', Dutch: 'Tech & AI',
    Swedish: 'Tech & AI',
  },
  readMore: {
    English: 'Read More', Uzbek: "Ko'proq o'qish", Turkish: 'Devamını Oku',
    Russian: 'Читать далее', Spanish: 'Leer más', French: 'Lire plus',
    German: 'Mehr lesen', Arabic: 'اقرأ المزيد', Chinese: '阅读更多',
    Japanese: '続きを読む', Korean: '더 읽기', Hindi: 'और पढ़ें',
    Portuguese: 'Ler mais', Italian: 'Leggi di più', Polish: 'Czytaj więcej',
    Ukrainian: 'Читати далі', Kazakh: 'Толығырақ оқу', Azerbaijani: 'Daha çox oxu',
    Persian: 'بیشتر بخوانید', Indonesian: 'Baca Selengkapnya', Dutch: 'Meer lezen',
    Swedish: 'Läs mer',
  },
  noNews: {
    English: 'No news articles found.', Uzbek: "Yangiliklar topilmadi.",
    Turkish: 'Haber bulunamadı.', Russian: 'Статьи не найдены.',
    Spanish: 'No se encontraron artículos.', French: 'Aucun article trouvé.',
    German: 'Keine Artikel gefunden.', Arabic: 'لم يتم العثور على مقالات.',
    Chinese: '未找到新闻文章。', Japanese: '記事が見つかりません。',
    Korean: '뉴스 기사를 찾을 수 없습니다.', Hindi: 'कोई समाचार नहीं मिला।',
    Portuguese: 'Nenhum artigo encontrado.', Italian: 'Nessun articolo trovato.',
    Polish: 'Nie znaleziono artykułów.', Ukrainian: 'Статті не знайдено.',
    Kazakh: 'Мақалалар табылмады.', Azerbaijani: 'Məqalə tapılmadı.',
    Persian: 'مقاله‌ای یافت نشد.', Indonesian: 'Tidak ada artikel berita.',
    Dutch: 'Geen artikelen gevonden.', Swedish: 'Inga artiklar hittades.',
  },
  refresh: {
    English: 'Refresh', Uzbek: 'Yangilash', Turkish: 'Yenile', Russian: 'Обновить',
    Spanish: 'Actualizar', French: 'Actualiser', German: 'Aktualisieren',
    Arabic: 'تحديث', Chinese: '刷新', Japanese: '更新', Korean: '새로고침',
    Hindi: 'रीफ्रेश', Portuguese: 'Atualizar', Italian: 'Aggiorna', Polish: 'Odśwież',
    Ukrainian: 'Оновити', Kazakh: 'Жаңарту', Azerbaijani: 'Yenilə', Persian: 'بازنشانی',
    Indonesian: 'Segarkan', Dutch: 'Vernieuwen', Swedish: 'Uppdatera',
  },
  errorLoading: {
    English: 'Could not load news. Please try again.',
    Uzbek: "Yangiliklarni yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Haberler yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить новости. Попробуйте снова.',
    Spanish: 'No se pudieron cargar las noticias. Inténtalo de nuevo.',
    French: 'Impossible de charger les actualités. Veuillez réessayer.',
    German: 'Nachrichten konnten nicht geladen werden. Bitte erneut versuchen.',
    Arabic: 'تعذر تحميل الأخبار. يرجى المحاولة مرة أخرى.',
    Chinese: '无法加载新闻，请重试。', Japanese: 'ニュースを読み込めませんでした。再試行してください。',
    Korean: '뉴스를 불러올 수 없습니다. 다시 시도해주세요.',
    Hindi: 'समाचार लोड नहीं हो सका। कृपया पुनः प्रयास करें।',
    Portuguese: 'Não foi possível carregar as notícias. Tente novamente.',
    Italian: 'Impossibile caricare le notizie. Riprova.',
    Polish: 'Nie można załadować wiadomości. Spróbuj ponownie.',
    Ukrainian: 'Не вдалося завантажити новини. Спробуйте ще раз.',
    Kazakh: 'Жаңалықтарды жүктеу мүмкін болмады. Қайталап көріңіз.',
    Azerbaijani: 'Xəbərlər yüklənə bilmədi. Yenidən cəhd edin.',
    Persian: 'بارگذاری اخبار ممکن نشد. لطفاً دوباره تلاش کنید.',
    Indonesian: 'Tidak dapat memuat berita. Silakan coba lagi.',
    Dutch: 'Nieuws kon niet worden geladen. Probeer het opnieuw.',
    Swedish: 'Kunde inte ladda nyheter. Försök igen.',
  },
};

function nt(key: string, language: string): string {
  const t = newsT[key];
  if (!t) return key;
  return t[language] || t['English'] || key;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

type Filter = 'all' | 'career' | 'tech';

export default function NewsTab({ language }: NewsTabProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const load = async (f: Filter = filter) => {
    setLoading(true);
    setError(null);
    try {
      let results: NewsArticle[];
      if (f === 'career') results = await fetchCareerNews();
      else if (f === 'tech') results = await fetchTechNews();
      else results = await fetchAllNews();
      setArticles(results);
    } catch (err) {
      setError(err instanceof NewsApiError ? err.message : nt('errorLoading', language));
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('all'); }, []);

  const handleFilter = (f: Filter) => {
    setFilter(f);
    load(f);
  };

  const filtered = filter === 'all' ? articles : articles.filter(a => a.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{nt('newsTitle', language)}</h1>
          <p className="text-gray-400">{nt('newsSubtitle', language)}</p>
        </div>
        <button onClick={() => load(filter)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {nt('refresh', language)}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'career', 'tech'] as Filter[]).map((f) => (
          <button key={f} onClick={() => handleFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-[#ff4e00] text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}>
            {f === 'career' && <Briefcase className="w-3.5 h-3.5" />}
            {f === 'tech' && <Cpu className="w-3.5 h-3.5" />}
            {f === 'all' && <Newspaper className="w-3.5 h-3.5" />}
            {nt(f === 'tech' ? 'tech' : f, language)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300 text-sm">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center text-gray-400">
          {nt('noNews', language)}
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((article) => (
            <div key={article.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-[#ff4e00]/40 transition-colors flex flex-col">
              {article.imageUrl && (
                <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    article.category === 'career' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {article.category === 'career' ? nt('career', language) : nt('tech', language)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  <span className="text-xs text-gray-500">{article.source}</span>
                </div>
                <h3 className="font-semibold text-white leading-snug line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 flex-1">{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 text-[#ff4e00] rounded-xl text-sm font-medium transition-colors">
                  {nt('readMore', language)}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}