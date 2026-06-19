import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Briefcase, Cpu, RefreshCw, Clock } from 'lucide-react';
import { fetchAllNews, fetchCareerNews, fetchTechNews, NewsArticle, NewsApiError } from '../services/newsApi';

interface NewsTabProps {
  language: string;
}

const newsT: { [key: string]: { [lang: string]: string } } = {
  newsTitle: {
    English: 'Career & Tech News',
    Uzbek: "Karyera va texnologiya yangiliklari",
    Turkish: 'Kariyer & Teknoloji Haberleri',
    Russian: 'Карьера и технологии: новости',
    Spanish: 'Noticias de Carrera y Tecnología',
    French: 'Actualités Carrière & Tech',
    German: 'Karriere & Tech Nachrichten',
  },
  newsSubtitle: {
    English: 'Stay ahead with the latest job market and AI trends',
    Uzbek: "Ish bozori va AI tendensiyalaridan xabardor bo'ling",
    Turkish: 'En son iş piyasası ve yapay zeka trendleriyle öne geçin',
    Russian: 'Будьте в курсе последних тенденций рынка труда и ИИ',
    Spanish: 'Mantente al día con las últimas tendencias del mercado laboral e IA',
    French: 'Restez en avance avec les dernières tendances du marché du travail et de l\'IA',
    German: 'Bleiben Sie mit den neuesten Arbeitsmarkt- und KI-Trends vorne',
  },
  all: {
    English: 'All', Uzbek: 'Barchasi', Turkish: 'Tümü', Russian: 'Все',
    Spanish: 'Todo', French: 'Tout', German: 'Alle',
  },
  career: {
    English: 'Career', Uzbek: 'Karyera', Turkish: 'Kariyer', Russian: 'Карьера',
    Spanish: 'Carrera', French: 'Carrière', German: 'Karriere',
  },
  tech: {
    English: 'Tech & AI', Uzbek: "Texnologiya va AI", Turkish: 'Teknoloji & AI', Russian: 'Технологии и ИИ',
    Spanish: 'Tecnología e IA', French: 'Tech & IA', German: 'Tech & KI',
  },
  readMore: {
    English: 'Read More', Uzbek: "Ko'proq o'qish", Turkish: 'Devamını Oku', Russian: 'Читать далее',
    Spanish: 'Leer más', French: 'Lire plus', German: 'Mehr lesen',
  },
  noNews: {
    English: 'No news articles found.',
    Uzbek: "Yangiliklar topilmadi.",
    Turkish: 'Haber bulunamadı.',
    Russian: 'Статьи не найдены.',
    Spanish: 'No se encontraron artículos.',
    French: 'Aucun article trouvé.',
    German: 'Keine Artikel gefunden.',
  },
  errorLoading: {
    English: 'Could not load news. Please try again.',
    Uzbek: "Yangiliklarni yuklab bo'lmadi. Qaytadan urinib ko'ring.",
    Turkish: 'Haberler yüklenemedi. Lütfen tekrar deneyin.',
    Russian: 'Не удалось загрузить новости. Попробуйте снова.',
    Spanish: 'No se pudieron cargar las noticias. Inténtalo de nuevo.',
    French: 'Impossible de charger les actualités. Veuillez réessayer.',
    German: 'Nachrichten konnten nicht geladen werden. Bitte erneut versuchen.',
  },
  refresh: {
    English: 'Refresh', Uzbek: 'Yangilash', Turkish: 'Yenile', Russian: 'Обновить',
    Spanish: 'Actualizar', French: 'Actualiser', German: 'Aktualisieren',
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
        <button
          onClick={() => load(filter)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {nt('refresh', language)}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'career', 'tech'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-[#ff4e00] text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-300 text-sm">
          {error}
        </div>
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
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    article.category === 'career'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {article.category === 'career'
                      ? nt('career', language)
                      : nt('tech', language)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  <span className="text-xs text-gray-500">{article.source}</span>
                </div>

                <h3 className="font-semibold text-white leading-snug line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 flex-1">{article.description}</p>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ff4e00]/10 hover:bg-[#ff4e00]/20 text-[#ff4e00] rounded-xl text-sm font-medium transition-colors"
                >
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
