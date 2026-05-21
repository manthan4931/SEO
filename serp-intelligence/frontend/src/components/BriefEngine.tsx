import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, 
  ChevronRight, 
  Download, 
  FileCode, 
  FileJson, 
  Send, 
  Filter, 
  Edit3, 
  Share2, 
  GripVertical, 
  CheckCircle2, 
  Hash, 
  Info, 
  Plus, 
  Layout, 
  Sparkles,
  Search,
  Loader2,
  Copy,
  HelpCircle,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchReports, AnalysisReport, fetchDomainRankings } from '../lib/api';

export default function BriefEngine() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [myDomain, setMyDomain] = useState('');
  const [domainKeywords, setDomainKeywords] = useState<any[]>([]);
  const [fetchingDomain, setFetchingDomain] = useState(false);

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [reports.length, selectedReport?.id]);

  const loadReports = async () => {
    try {
      const data = await fetchReports();
      if (Array.isArray(data)) {
        setReports(data);
        if (data.length > 0) {
          if (!selectedReport || reports.length === 0 || data.length > reports.length) {
            setSelectedReport(data[0]);
          } else {
            const updated = data.find(r => r.id === selectedReport.id);
            if (updated && JSON.stringify(updated.report_data) !== JSON.stringify(selectedReport.report_data)) {
              setSelectedReport(updated);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDomainKeywords = async () => {
    if (!myDomain.trim()) return;
    setFetchingDomain(true);
    try {
      const res = await fetchDomainRankings(myDomain);
      if (res && Array.isArray(res.keywords)) {
        setDomainKeywords(res.keywords);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to fetch domain rankings.");
    } finally {
      setFetchingDomain(false);
    }
  };

  // Safe access to the brief content
  const brief = selectedReport?.report_data?.content_brief || selectedReport?.report_data?.analysis?.content_brief;
  // If brief is a string (markdown), we might need to parse it or just display it.
  // The backend seems to return a string from llm.invoke().

  const exportPDF = () => {
    if (!selectedReport) return;
    const { jsPDF } = (window as any).jspdf || {};
    if (!jsPDF) {
      window.print();
      return;
    }
    const doc = new jsPDF();
    const splitTitle = doc.splitTextToSize(`Content Brief: ${selectedReport.keyword_text}`, 180);
    doc.text(splitTitle, 10, 10);
    doc.setFontSize(10);
    const splitContent = doc.splitTextToSize(brief || "", 180);
    doc.text(splitContent, 10, 30);
    doc.save(`${selectedReport.keyword_text}_brief.pdf`);
  };

  const exportDoc = () => {
    if (!selectedReport) return;
    const element = document.createElement("a");
    const file = new Blob([brief || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedReport.keyword_text}_brief.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">
          <span className="opacity-60">Step 08</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-30" />
          <span className="text-primary">Brief Engine</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-container-low transition-all font-bold text-xs uppercase tracking-widest"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button 
            onClick={exportDoc}
            className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-container-low transition-all font-bold text-xs uppercase tracking-widest"
          >
            <Layout className="w-4 h-4" /> Doc
          </button>
          <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-black flex items-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-widest hover:brightness-110 shadow-lg">
            <Send className="w-4 h-4" /> Export to CMS
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left: Brief List Table */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-bold text-on-surface tracking-tight">Keyword-Prioritized Briefs</h3>
              <button onClick={loadReports}>
                <Filter className={cn("w-4 h-4 text-outline", loading && "animate-spin")} />
              </button>
            </div>
            <div className="divide-y divide-outline-variant/30 max-h-[600px] overflow-y-auto">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  onClick={() => setSelectedReport(report)}
                  className={cn(
                    "p-5 hover:bg-surface-container-low cursor-pointer transition-all border-l-[3px]",
                    selectedReport?.id === report.id ? "border-secondary-fixed bg-surface-container shadow-inner" : "border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-2 text-primary">
                    <span className={cn(
                      "font-mono font-bold px-2 py-0.5 rounded text-[11px] tracking-tight",
                      selectedReport?.id === report.id ? "bg-secondary-container text-secondary" : "bg-surface-container-highest opacity-70"
                    )}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                      Ready
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface text-sm mb-1">{report.keyword_text}</h4>
                </div>
              ))}
              {reports.length === 0 && !loading && (
                <div className="p-10 text-center text-on-surface-variant opacity-50 text-sm font-bold uppercase tracking-widest">
                  No briefs generated yet.
                </div>
              )}
              {loading && (
                <div className="p-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Domain SEO Rankings Widget */}
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-on-surface tracking-tight flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span>Domain SEO Standings</span>
              </h3>
              <p className="text-[11px] text-on-surface-variant/70 font-semibold mt-0.5">
                Fetch top keywords where your website ranks on Google USA
              </p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="domain.com (e.g. apple.com)"
                value={myDomain}
                onChange={(e) => setMyDomain(e.target.value)}
                className="bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-secondary flex-grow"
              />
              <button
                onClick={handleFetchDomainKeywords}
                disabled={fetchingDomain}
                className="bg-primary hover:bg-primary/80 disabled:bg-primary/50 text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
              >
                {fetchingDomain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Fetch"}
              </button>
            </div>

            {domainKeywords.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60">
                  <span>Keyword</span>
                  <span>Rank / Vol</span>
                </div>
                <div className="divide-y divide-outline-variant/30 max-h-48 overflow-y-auto pr-1.5 custom-scrollbar">
                  {domainKeywords.map((kw: any, idx: number) => {
                    let badgeClass = "bg-surface-container-highest text-on-surface-variant";
                    if (kw.position === 1) badgeClass = "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20";
                    else if (kw.position <= 3) badgeClass = "bg-gray-400/10 text-gray-500 border border-gray-400/20";
                    else if (kw.position <= 10) badgeClass = "bg-amber-600/10 text-amber-700 border border-amber-600/20";
                    
                    return (
                      <div key={idx} className="py-2 flex justify-between items-center text-xs font-medium min-w-0">
                        <div className="truncate mr-2">
                          <p className="font-bold text-on-surface truncate" title={kw.keyword}>{kw.keyword}</p>
                          <p className="text-[10px] text-on-surface-variant/60 font-mono">
                            CPC: ${kw.cpc?.toFixed(2) || "0.00"} | Share: {kw.traffic_share?.toFixed(1) || "0.0"}%
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-tight", badgeClass)}>
                            #{kw.position}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-semibold">
                            {kw.volume?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-primary-container p-6 rounded-xl text-on-primary-fixed border border-secondary-fixed/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-secondary-fixed/5 rounded-full -ml-16 -mt-16 blur-2xl" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-secondary-fixed fill-secondary-fixed" />
              <span className="font-black text-[11px] text-secondary-fixed uppercase tracking-widest">Agent Intelligence</span>
            </div>
            <p className="text-[13px] leading-relaxed opacity-80 italic font-medium">
              "Brief generation complete. Structure optimized based on competitor heading patterns and semantic gap analysis."
            </p>
          </div>
        </div>

        {/* Right: Brief Detail View */}
        <div className="col-span-12 xl:col-span-8 bg-white border border-outline-variant rounded-xl shadow-lg min-h-[800px] flex flex-col">
          {selectedReport ? (
            <>
              {/* Detail Header */}
              <div className="p-8 border-b border-outline-variant flex justify-between items-start bg-[radial-gradient(#f8f9ff_1.5px,transparent_1.5px)] bg-[size:32px_32px]">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-sm">AI Generated</span>
                    <span className="text-on-surface-variant text-[11px] font-bold opacity-50 uppercase tracking-tight">Keyword: {selectedReport.keyword_text}</span>
                  </div>
                  <h2 className="text-4xl font-bold text-primary tracking-tight">Content Brief</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(brief || "");
                      alert("Copied to clipboard!");
                    }}
                    className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors border border-outline/10 group"
                    title="Copy to Clipboard"
                  >
                    <Copy className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
                  </button>
                  <button className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors border border-outline/10"><Edit3 className="w-4 h-4 text-on-surface-variant" /></button>
                  <button className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors border border-outline/10"><Share2 className="w-4 h-4 text-on-surface-variant" /></button>
                </div>
              </div>

              {/* Content Workspace */}
              <div className="p-8 flex-grow overflow-y-auto max-h-[800px]">
                <div className="prose prose-slate max-w-none">
                  <div className="mb-8 border-b border-outline-variant pb-6">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-70 mb-2">AI Strategy Summary</p>
                    <p className="text-sm text-on-surface-variant italic">
                      This brief is synthesized from top 10 SERP competitors, semantic cluster mapping, and identified content gaps for "{selectedReport.keyword_text}".
                    </p>
                  </div>
                  <div className="text-on-surface leading-relaxed">
                    <ReactMarkdown>{brief || "Generating brief content..."}</ReactMarkdown>
                  </div>

                  {/* NEW: Competitor Sources Section */}
                  {selectedReport?.report_data?.serp_top_10 && (
                    <div className="mt-16 pt-8 border-t border-outline-variant">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Verified Competitor Sources
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedReport.report_data.serp_top_10.map((res: any, idx: number) => (
                          <div key={idx} className="p-4 bg-surface-container-low/50 border border-outline-variant rounded-xl group hover:border-secondary transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">{res.title}</p>
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-primary font-mono block mt-1 hover:underline truncate"
                                >
                                  {res.url}
                                </a>
                              </div>
                              <span className="text-[10px] font-black text-on-surface-variant opacity-20">#{idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-on-surface-variant opacity-40">
              <FileCode className="w-24 h-24 mb-4 stroke-[1]" />
              <p className="font-black text-xl uppercase tracking-[0.2em]">Select a brief to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
