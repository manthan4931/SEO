const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
};

export interface Keyword {
  id: number;
  keyword: string;
  country: string;
  language: string;
  volume?: number | null;
  created_at: string;
}

export interface AnalysisReport {
  id: number;
  keyword: number;
  keyword_text: string;
  report_data: any;
  created_at: string;
}

export const fetchKeywords = () => api.get('/keywords/');
export const createKeyword = (data: { keyword: string; country?: string; language?: string }) => api.post('/keywords/', data);
export const runAnalysis = (keywordId: number) => api.post('/analysis/analyze/', { keyword_id: keywordId });
export const fetchReports = () => api.get('/analysis/reports/');
export const fetchCompetitors = (keywordId?: number) => api.get(`/competitors/${keywordId ? `?keyword_id=${keywordId}` : ''}`);
export const brainstormKeywords = (topic: string) => api.post('/keywords/brainstorm/', { topic });
export const compareSEO = (myUrl: string, competitorId?: number, competitorUrl?: string) => api.post('/analysis/compare/', { 
  my_url: myUrl, 
  competitor_id: competitorId,
  competitor_url: competitorUrl
});
export const askRAG = (query: string) => api.post('/analysis/rag/', { query });
export const fetchReportForKeyword = (keywordId: number) => api.get(`/analysis/reports/?keyword_id=${keywordId}`);
export const fetchLogs = (keywordId: number) => api.get(`/keywords/${keywordId}/logs/`);
export const fetchDomainRankings = (domain: string) => api.post('/analysis/domain-rankings/', { domain });
