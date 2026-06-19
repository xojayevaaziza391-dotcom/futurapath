// GNews API service - works on deployed sites (free tier)
// Sign up at https://gnews.io to get a free API key
// Add to .env as VITE_GNEWS_API_KEY=your_key_here

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
  
  interface GNewsArticle {
    title: string;
    description: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  }
  
  interface GNewsResponse {
    totalArticles: number;
    articles: GNewsArticle[];
    errors?: string[];
  }
  
  const API_KEY = import.meta.env.VITE_GNEWS_API_KEY as string | undefined;
  const BASE_URL = 'https://gnews.io/api/v4';
  
  export class NewsApiError extends Error {}
  
  async function fetchNews(query: string, category: 'career' | 'tech'): Promise<NewsArticle[]> {
    if (!API_KEY) throw new NewsApiError('Missing VITE_GNEWS_API_KEY in environment.');
  
    const params = new URLSearchParams({
      q: query,
      lang: 'en',
      max: '10',
      sortby: 'publishedAt',
      apikey: API_KEY,
    });
  
    const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
  
    if (!response.ok) {
      if (response.status === 403) throw new NewsApiError('Invalid GNews API key.');
      if (response.status === 429) throw new NewsApiError('News rate limit reached. Please try again later.');
      throw new NewsApiError(`News fetch failed (${response.status}).`);
    }
  
    const json: GNewsResponse = await response.json();
  
    if (json.errors?.length) throw new NewsApiError(json.errors[0]);
  
    return json.articles
      .filter(a => a.title && a.description)
      .map((a, i): NewsArticle => ({
        id: `${category}-${i}-${a.publishedAt}`,
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source.name,
        publishedAt: a.publishedAt,
        imageUrl: a.image || undefined,
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
  