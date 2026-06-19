// NewsAPI.org service
// Sign up at https://newsapi.org/register to get a free API key
// Add to .env as VITE_NEWSAPI_KEY=your_key_here

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    category: 'career' | 'tech';
  }
  
  interface NewsAPIArticle {
    title: string;
    description: string | null;
    url: string;
    source: { name: string };
    publishedAt: string;
    urlToImage: string | null;
  }
  
  interface NewsAPIResponse {
    status: string;
    articles: NewsAPIArticle[];
    message?: string;
  }
  
  const API_KEY = import.meta.env.VITE_NEWSAPI_KEY as string | undefined;
  const BASE_URL = 'https://newsapi.org/v2';
  
  export class NewsApiError extends Error {}
  
  async function fetchNews(query: string, category: 'career' | 'tech'): Promise<NewsArticle[]> {
    if (!API_KEY) throw new NewsApiError('Missing VITE_NEWSAPI_KEY in environment.');
  
    const params = new URLSearchParams({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '10',
      apiKey: API_KEY,
    });
  
    const response = await fetch(`${BASE_URL}/everything?${params.toString()}`);
    const json: NewsAPIResponse = await response.json();
  
    if (json.status !== 'ok') {
      throw new NewsApiError(json.message || 'Failed to fetch news.');
    }
  
    return json.articles
      .filter(a => a.title && a.description && !a.title.includes('[Removed]'))
      .map((a, i): NewsArticle => ({
        id: `${category}-${i}-${a.publishedAt}`,
        title: a.title,
        description: a.description!,
        url: a.url,
        source: a.source.name,
        publishedAt: a.publishedAt,
        imageUrl: a.urlToImage || undefined,
        category,
      }));
  }
  
  export async function fetchCareerNews(): Promise<NewsArticle[]> {
    return fetchNews('career jobs hiring employment workforce future work', 'career');
  }
  
  export async function fetchTechNews(): Promise<NewsArticle[]> {
    return fetchNews('artificial intelligence technology AI automation future', 'tech');
  }
  
  export async function fetchAllNews(): Promise<NewsArticle[]> {
    const [career, tech] = await Promise.allSettled([fetchCareerNews(), fetchTechNews()]);
  
    const careerArticles = career.status === 'fulfilled' ? career.value : [];
    const techArticles = tech.status === 'fulfilled' ? tech.value : [];
  
    // Interleave career and tech articles
    const merged: NewsArticle[] = [];
    const max = Math.max(careerArticles.length, techArticles.length);
    for (let i = 0; i < max; i++) {
      if (careerArticles[i]) merged.push(careerArticles[i]);
      if (techArticles[i]) merged.push(techArticles[i]);
    }
    return merged;
  }
  