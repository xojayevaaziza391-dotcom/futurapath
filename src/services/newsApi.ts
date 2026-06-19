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

export class NewsApiError extends Error {}

const API_KEY = import.meta.env.VITE_NEWSDATA_KEY as string | undefined;
const BASE_URL = 'https://newsdata.io/api/1/news';

async function fetchNews(query: string, category: 'career' | 'tech'): Promise<NewsArticle[]> {
  if (!API_KEY) throw new NewsApiError('Missing VITE_NEWSDATA_KEY in environment.');

  const params = new URLSearchParams({
    apikey: API_KEY,
    q: query,
    language: 'en',
    size: '10',
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    if (response.status === 401) throw new NewsApiError('Invalid API key. Please check VITE_NEWSDATA_KEY.');
    if (response.status === 429) throw new NewsApiError('News rate limit reached. Please try again later.');
    throw new NewsApiError(`Failed to fetch news (${response.status}).`);
  }

  const json = await response.json();

  if (!Array.isArray(json.results)) return [];

  return json.results
    .filter((a: any) => a.title && a.description)
    .map((a: any, i: number): NewsArticle => ({
      id: `${category}-${i}-${a.pubDate}`,
      title: a.title,
      description: a.description,
      url: a.link,
      source: a.source_id || 'Unknown',
      publishedAt: a.pubDate,
      imageUrl: a.image_url || undefined,
      category,
    }));
}

export async function fetchCareerNews(): Promise<NewsArticle[]> {
  return fetchNews('career jobs hiring employment future work', 'career');
}

export async function fetchTechNews(): Promise<NewsArticle[]> {
  return fetchNews('artificial intelligence technology AI automation', 'tech');
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  const [career, tech] = await Promise.allSettled([fetchCareerNews(), fetchTechNews()]);
  const careerArticles = career.status === 'fulfilled' ? career.value : [];
  const techArticles = tech.status === 'fulfilled' ? tech.value : [];
  const merged: NewsArticle[] = [];
  const max = Math.max(careerArticles.length, techArticles.length);
  for (let i = 0; i < max; i++) {
    if (careerArticles[i]) merged.push(careerArticles[i]);
    if (techArticles[i]) merged.push(techArticles[i]);
  }
  return merged;
}