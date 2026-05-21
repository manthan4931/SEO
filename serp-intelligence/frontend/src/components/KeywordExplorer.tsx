import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Zap, 
  BrainCircuit, 
  Rocket, 
  History, 
  Download, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  SearchCode,
  PlusCircle,
  Sparkles,
  X,
  Loader2,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchKeywords, createKeyword, runAnalysis, Keyword, brainstormKeywords, fetchReportForKeyword, fetchCompetitors, fetchLogs } from '../lib/api';

export default function KeywordExplorer() {
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rawCompetitors, setRawCompetitors] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadKeywords();
  }, []);

  // Polling for logs when analyzing
  useEffect(() => {
    let interval: any;
    if (analyzingId) {
      interval = setInterval(async () => {
        try {
          const newLogs = await fetchLogs(analyzingId);
          setLogs(newLogs);
        } catch (e) { console.error(e); }
      }, 3000);
    } else {
      setLogs([]);
    }
    return () => clearInterval(interval);
  }, [analyzingId]);

  const loadKeywords = async () => {
    try {
      const data = await fetchKeywords();
      setKeywords(data);
    } catch (error) {
      console.error('Failed to load keywords', error);
    }
  };

  const handleStartScrape = async () => {
    if (!keywordInput.trim()) return;
    setLoading(true);
    try {
      const lines = keywordInput.split('\n').filter(l => l.trim());
      for (const kw of lines) {
        const newKeyword = await createKeyword({ keyword: kw.trim() });
        setKeywords(prev => [newKeyword, ...prev]);
        
        // Trigger individual analysis
        await handleAnalysis(newKeyword.id);
      }
      setKeywordInput('');
    } catch (error) {
      console.error('Scrape failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async (id: number) => {
    setAnalyzingId(id);
    setSuccessMessage(null);
    try {
      await runAnalysis(id);
      await loadKeywords();
      setSuccessMessage("Pipeline Completed Successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Scrape failed: " + err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleToggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setReportData(null);
      setRawCompetitors([]);
    } else {
      setExpandedId(id);
      setReportData(null);
      setRawCompetitors([]);
      
      // 1. Fetch raw competitors immediately
      try {
        const comps = await fetchCompetitors(id);
        if (Array.isArray(comps)) {
          setRawCompetitors(comps);
        }
      } catch (e) { console.error(e); }

      // 2. Fetch full report
      try {
        const reports = await fetchReportForKeyword(id);
        if (Array.isArray(reports) && reports.length > 0) {
          setReportData(reports[0].report_data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const [discoveredKeywords, setDiscoveredKeywords] = useState<any[]>([]);

  const handleDiscovery = async (niche: string) => {
    if (!niche) return;
    setLoading(true);
    try {
      const ideas = await brainstormKeywords(niche);
      setDiscoveredKeywords(ideas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addDiscovered = () => {
    setKeywordInput(prev => {
      const existing = prev.split('\n').filter(l => l.trim());
      const newKws = discoveredKeywords.map(k => typeof k === 'string' ? k : k.keyword);
      const combined = Array.from(new Set([...existing, ...newKws]));
      return combined.join('\n');
    });
    setDiscoveredKeywords([]);
  };

  return (
    <div className="space-y-6 relative">
      {successMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-success text-on-success px-8 py-3 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-8 flex items-center gap-3 border-2 border-white/20">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-on-background tracking-tight">Refined Keyword List</h2>
            <div className="flex items-center gap-1.5 bg-secondary-container px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 text-secondary fill-current" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Active Engine</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <textarea 
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full h-40 bg-surface-container-low border border-outline-variant rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none outline-none shadow-inner" 
              placeholder="Paste your keywords here to start scraping... (one per line)"
            />
            <div className="flex justify-between items-center">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Step 2: Scrape & Analyze</p>
               <button 
                onClick={handleStartScrape}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-on-primary px-10 py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all text-sm disabled:opacity-50 shadow-lg"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Start Scrape'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-primary-container p-6 rounded-2xl border border-primary/20 shadow-lg h-full">
            <h3 className="text-lg font-bold text-on-primary-container mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-fixed" />
              AI Niche Discovery
            </h3>
            <p className="text-[10px] font-black text-secondary-fixed uppercase tracking-[0.2em] mb-6">Step 1: Brainstorm Ideas</p>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-primary-container opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="text"
                placeholder="Enter a niche (e.g. Real Estate SEO)"
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDiscovery((e.target as HTMLInputElement).value);
                }}
              />
            </div>

            {discoveredKeywords.length > 0 && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-secondary-fixed uppercase tracking-widest">Suggested Keywords</p>
                  <button 
                    onClick={addDiscovered}
                    className="text-[10px] font-black text-on-primary-container bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all"
                  >
                    Add All to List
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {discoveredKeywords.map((kw, i) => {
                    const text = typeof kw === 'string' ? kw : kw.keyword;
                    const volume = typeof kw === 'string' ? null : kw.volume;
                    return (
                      <div key={i} className="bg-white/5 border border-white/10 p-2 px-3 rounded-lg text-xs text-white/80 font-medium flex justify-between items-center group/item hover:bg-white/10 transition-all min-w-0">
                        <span className="truncate mr-2 font-bold" title={text}>{text}</span>
                        {volume !== null && volume !== undefined && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-secondary-container/20 text-secondary-fixed rounded text-[9px] font-mono font-bold tracking-tight">
                            {volume.toLocaleString()} US
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {!discoveredKeywords.length && (
              <div className="mt-12 flex flex-col items-center justify-center text-center opacity-30">
                <BrainCircuit className="w-12 h-12 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Niche Entry</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Queue */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 className="font-bold text-on-surface">Intelligence Queue</h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-on-surface-variant">{keywords.length} keywords tracked</span>
            <button onClick={loadKeywords} className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded transition-colors">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                <th className="px-6 py-3">Keyword</th>
                <th className="px-6 py-3">Volume (US)</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-[13px]">
              {keywords.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    onClick={() => handleToggleExpand(item.id)}
                    className={cn(
                      "hover:bg-surface-container-low transition-colors group cursor-pointer border-l-4",
                      expandedId === item.id ? "border-secondary bg-surface-container-low" : "border-transparent"
                    )}
                  >
                    <td className="px-6 py-4 font-semibold text-on-background">
                      <div className="flex items-center gap-2">
                        {item.keyword}
                        {expandedId === item.id ? <History className="w-3.5 h-3.5 opacity-50" /> : <Search className="w-3.5 h-3.5 opacity-30" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-mono font-bold">
                      {item.volume !== null && item.volume !== undefined ? (
                        <span className="bg-secondary-container/20 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-xs">
                          {item.volume.toLocaleString()} US/mo
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/40 italic">Enriching...</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{item.country} / {item.language}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-2 font-semibold",
                        analyzingId === item.id ? "text-secondary" : "text-on-surface-variant"
                      )}>
                        {analyzingId === item.id ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            Ready
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr className="bg-surface-container/50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          {/* Live Console Feed */}
                          {analyzingId === item.id && (
                            <div className="bg-on-background text-white p-6 rounded-xl font-mono text-[11px] shadow-2xl border-2 border-primary/20 relative overflow-hidden group">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#6ffbbe]" />
                                  <span className="font-black uppercase tracking-widest text-primary">Live Pipeline Console</span>
                                </div>
                                <span className="opacity-40 text-[9px] uppercase tracking-tighter">System Output: Active</span>
                              </div>
                              <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                                {logs.length > 0 ? (
                                  logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start animate-in fade-in duration-500">
                                      <span className="opacity-20 shrink-0 font-bold">{new Date(log.created_at).toLocaleTimeString([], { hour12: false })}</span>
                                      <span className={cn(
                                        "font-bold",
                                        log.level === 'ERROR' ? 'text-error' : 
                                        log.level === 'SUCCESS' ? 'text-secondary' : 
                                        'text-white opacity-80'
                                      )}>
                                        {log.level === 'SUCCESS' ? '✓' : log.level === 'ERROR' ? '!' : '>'} {log.message}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="opacity-30 italic">Initializing scraper connection...</div>
                                )}
                              </div>
                            </div>
                          )}

                          {reportData || rawCompetitors.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary flex justify-between items-center">
                                  <span>Top 10 SERP Results</span>
                                  {!reportData && <span className="animate-pulse text-[9px] text-primary">AI Analyzing...</span>}
                                </h4>
                                <div className="grid gap-3">
                                  {(reportData?.serp_top_10 || rawCompetitors).map((res: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-white border border-outline-variant rounded-lg shadow-sm hover:border-secondary transition-all group">
                                      <div className="flex justify-between items-start gap-4">
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-primary group-hover:underline underline-offset-2 truncate">
                                            {res.title || res.page_title}
                                          </p>
                                          <a href={res.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-mono block mt-1 hover:underline truncate">
                                            {res.url}
                                          </a>
                                        </div>
                                        <span className="text-[10px] font-black text-on-surface-variant opacity-30">#{idx + 1}</span>
                                      </div>
                                      {(res.snippet || res.meta_description) && (
                                        <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed italic opacity-80 line-clamp-2">
                                          {res.snippet || res.meta_description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                {reportData ? (
                                  <>
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-error">People Also Ask (PAA)</h4>
                                      <div className="space-y-2">
                                        {(reportData.paa_questions || []).map((q: string, idx: number) => (
                                          <div key={idx} className="p-3 bg-error/5 border border-error/10 rounded-lg flex items-center gap-3">
                                            <HelpCircle className="w-4 h-4 text-error opacity-40" />
                                            <p className="text-xs font-bold text-on-surface">{q}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Gems</h4>
                                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                                        <div>
                                          <p className="text-[9px] font-black text-primary uppercase mb-1 opacity-60">High-Value Keyword Gaps</p>
                                          <div className="space-y-2 mt-2">
                                            {Array.isArray(reportData.analysis?.keyword_gaps) ? (
                                              reportData.analysis.keyword_gaps.map((gap: any, i: number) => (
                                                <div key={i} className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl hover:border-primary/40 transition-all">
                                                  <div className="flex justify-between items-center gap-2">
                                                    <span className="font-bold text-on-surface text-xs">{gap.keyword}</span>
                                                    {gap.opportunity_score && (
                                                      <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                        {gap.opportunity_score}% Opportunity
                                                      </span>
                                                    )}
                                                  </div>
                                                  {gap.reason && (
                                                    <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
                                                      {gap.reason}
                                                    </p>
                                                  )}
                                                </div>
                                              ))
                                            ) : (
                                              <p className="text-xs font-medium text-on-surface leading-relaxed">
                                                {reportData.analysis?.keyword_gaps || "Analyzing gaps..."}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[9px] font-black text-primary uppercase mb-1 opacity-60">Common Competitor Questions</p>
                                          <div className="space-y-2 mt-2">
                                            {Array.isArray(reportData.analysis?.faq_analysis) ? (
                                              reportData.analysis.faq_analysis.map((faq: any, i: number) => (
                                                <div key={i} className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl hover:border-secondary/40 transition-all">
                                                  <span className="font-bold text-on-surface text-xs block leading-snug">{faq.question}</span>
                                                  <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black uppercase tracking-wider">
                                                    {faq.category && (
                                                      <span className="text-secondary">
                                                        {faq.category}
                                                      </span>
                                                    )}
                                                    {faq.source && (
                                                      <span className="text-on-surface-variant opacity-60">
                                                        Source: {faq.source}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              ))
                                            ) : (
                                              <p className="text-xs font-medium text-on-surface leading-relaxed">
                                                {reportData.analysis?.faq_analysis || "Extracting FAQs..."}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full bg-surface-container-low/30 rounded-2xl border-2 border-dashed border-outline-variant p-8 opacity-40">
                                    <BrainCircuit className="w-12 h-12 mb-4 animate-pulse" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-center">Synthesizing AI Strategy...</p>
                                    <p className="text-[10px] mt-2 text-center">Competitors identified. Analyzing content depth and semantic gaps.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant py-8 justify-center">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Connecting to SERP Pipeline...
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {keywords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant opacity-60">
                    No keywords found. Start by entering some above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
