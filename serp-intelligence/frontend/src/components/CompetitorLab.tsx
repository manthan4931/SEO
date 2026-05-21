import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Download, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  Grid3X3, 
  PlusCircle,
  Sparkles,
  X,
  Loader2,
  Search,
  Zap,
  FileText,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchCompetitors, Keyword, fetchKeywords, compareSEO } from '../lib/api';

export default function CompetitorLab() {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUrl, setMyUrl] = useState('');
  const [manualCompetitorUrl, setManualCompetitorUrl] = useState('');
  const [comparison, setComparison] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedKeywordId) {
      loadCompetitors(selectedKeywordId);
    }
  }, [selectedKeywordId]);

  const init = async () => {
    try {
      const kws = await fetchKeywords();
      setKeywords(kws);
      if (kws.length > 0) {
        setSelectedKeywordId(kws[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCompetitors = async (id: number) => {
    setLoading(true);
    try {
      const data = await fetchCompetitors(id);
      setCompetitors(data);
      if (data.length > 0) {
        setSelectedCompetitor(data[0]);
      }
    } catch (error) {
      console.error('Failed to load competitors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!myUrl || (!selectedCompetitor && !manualCompetitorUrl)) return;
    setComparing(true);
    try {
      const data = await compareSEO(myUrl, selectedCompetitor?.id, manualCompetitorUrl);
      setComparison(data);
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  const exportCompetitors = () => {
    const { jsPDF } = (window as any).jspdf || {};
    if (!jsPDF) {
      window.print();
      return;
    }
    const doc = new jsPDF();
    const primaryColor = [0, 108, 73]; // #006c49 (UI Primary)
    const accentColor = [26, 28, 30];   // #1a1c1e (UI Dark)

    // Header Branding
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // UI Green accent line
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 42, 210, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("SERP INTEL", 15, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("EXECUTIVE COMPARATIVE INTEL & AUDIT REPORT", 15, 30);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 15, 38);

    let y = 60;

    // AI Comparison Section (if exists)
    if (comparison && comparison.comparison) {
      const comp = comparison.comparison;

      // Executive Scorecard
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Executive SEO Scorecard", 15, y);
      y += 8;

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 12;

      // Draw scores side-by-side
      doc.setFillColor(240, 248, 245);
      doc.rect(15, y, 85, 25, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(9);
      doc.text("MY WEBSITE SEO SCORE", 20, y + 8);
      doc.setFontSize(20);
      doc.text(`${comp.my_score || 0}/100`, 20, y + 18);

      doc.setFillColor(253, 242, 242);
      doc.rect(110, y, 85, 25, 'F');
      doc.setTextColor(185, 28, 28);
      doc.setFontSize(9);
      doc.text("COMPETITOR SEO SCORE", 115, y + 8);
      doc.setFontSize(20);
      doc.text(`${comp.competitor_score || 0}/100`, 115, y + 18);
      
      y += 35;

      // Verdict callout box
      doc.setFillColor(26, 28, 30);
      doc.rect(15, y, 180, 28, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("AI SEO VERDICT:", 20, y + 8);
      doc.setTextColor(78, 222, 163);
      doc.text(`${comp.seo_verdict || "Under Review"}`, 55, y + 8);

      doc.setTextColor(220, 220, 220);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const verdictLines = doc.splitTextToSize(comp.verdict_reason || "", 170);
      doc.text(verdictLines, 20, y + 15);

      y += 40;

      // Title & Meta Desc Analysis
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Metadata & Outlines Comparison", 15, y);
      y += 8;

      const diff = comp.structured_diff || {};
      const itemsToCompare = [
        { label: "1. Page Title Optimization", data: diff.title },
        { label: "2. Content Depth & Length", data: diff.word_count },
        { label: "3. Headings & Search Intent", data: diff.headings_outline },
        { label: "4. Click-Through Rate (Meta Description)", data: diff.meta_description }
      ];

      itemsToCompare.forEach(item => {
        if (y > 230) { doc.addPage(); y = 25; }
        
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(item.label, 15, y);
        y += 5;

        // Draw side-by-side comparisons
        doc.setFillColor(248, 249, 250);
        doc.rect(15, y, 180, 20, 'F');
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        
        doc.setTextColor(100, 100, 100);
        doc.text("My Site:", 20, y + 6);
        doc.setTextColor(30, 30, 30);
        doc.text(doc.splitTextToSize(item.data?.my_site || "N/A", 70), 32, y + 6);

        doc.setTextColor(100, 100, 100);
        doc.text("Competitor:", 110, y + 6);
        doc.setTextColor(30, 30, 30);
        doc.text(doc.splitTextToSize(item.data?.competitor || "N/A", 70), 126, y + 6);

        y += 24;

        doc.setFont("helvetica", "oblique");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        const analysisText = `Analysis: ${item.data?.analysis_note || ""}`;
        doc.text(doc.splitTextToSize(analysisText, 175), 18, y);
        y += 10;
      });

      // Page Break for Strategic Action Plan
      doc.addPage();
      y = 25;

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Action Plan to Outrank Competitor", 15, y);
      y += 8;

      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 12;

      // High impact changes list
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Required SEO Adjustments Checklist:", 15, y);
      y += 8;

      if (Array.isArray(comp.actionable_changes)) {
        comp.actionable_changes.forEach((change, index) => {
          doc.setFillColor(248, 249, 250);
          doc.rect(15, y, 180, 15, 'F');
          
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`STEP ${index + 1}`, 20, y + 9);
          
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.text(doc.splitTextToSize(change, 140), 38, y + 9);
          
          y += 19;
        });
      }

      y += 5;
      
      // Winning Action Card
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 180, 22, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("CORE WINNING ACTION Blueprint:", 20, y + 7);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(doc.splitTextToSize(`"${comp.winning_action || ""}"`, 170), 20, y + 14);
      
      y += 32;
    }

    // Competitor List Section
    if (y > 180) { doc.addPage(); y = 25; }
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Competitor Reference Index", 15, y);
    y += 10;

    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(9);

    competitors.forEach((c, i) => {
      if (y > 250) { doc.addPage(); y = 25; }
      
      doc.setFillColor(248, 249, 250);
      doc.rect(15, y, 180, 22, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.text(`${i+1}. ${c.page_title.substring(0, 70)}${c.page_title.length > 70 ? '...' : ''}`, 20, y + 7);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`URL: ${c.url.substring(0, 90)}`, 20, y + 13);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`Word Count: ${c.word_count} | Status: Scraped & Indexed`, 20, y + 18);
      
      y += 26;
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 285, 210, 15, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`CONFIDENTIAL | SERP INTELLIGENCE ENGINE | Page ${i} of ${pageCount}`, 105, 294, { align: 'center' });
    }

    doc.save(`SERP_SEO_Comparison_${selectedKeywordId || 'Report'}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-primary">Competitor Intelligence Lab</h2>
          <div className="flex items-center gap-4 mt-2">
            <select 
              value={selectedKeywordId || ''} 
              onChange={(e) => setSelectedKeywordId(Number(e.target.value))}
              className="bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-sm font-bold outline-none focus:ring-1 focus:ring-secondary"
            >
              {keywords.map(kw => <option key={kw.id} value={kw.id}>{kw.keyword}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-secondary font-bold text-[10px] tracking-wider px-2 py-0.5 bg-secondary-container rounded uppercase">Live Analysis</span>
              {selectedCompetitor && (
                <p className="text-on-surface-variant text-sm">
                  Active: <span className="font-mono text-primary font-medium tracking-tight">{selectedCompetitor.url}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportCompetitors}
            className="flex items-center gap-1.5 border border-outline-variant px-4 py-2 rounded-lg hover:bg-surface-container-low text-sm font-semibold transition-all"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => selectedKeywordId && loadCompetitors(selectedKeywordId)} className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 text-sm font-semibold transition-all">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      {/* Main Comparison Control */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-primary/20 shadow-xl mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-5 space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">My Website Intelligence</label>
            <div className="relative group">
              <Network className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="text" 
                value={myUrl}
                onChange={(e) => setMyUrl(e.target.value)}
                placeholder="https://my-site.com"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2">
            <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">Competitor Benchmark</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input 
                type="text" 
                value={manualCompetitorUrl || selectedCompetitor?.url || ''}
                onChange={(e) => setManualCompetitorUrl(e.target.value)}
                placeholder="Select competitor below or paste URL..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <button 
              onClick={handleCompare}
              disabled={comparing || (!selectedCompetitor && !manualCompetitorUrl)}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {comparing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
              {comparing ? "Analyzing" : "Compare"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Metrics & Structure */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Word Count</p>
              <p className="text-3xl font-black text-primary">{selectedCompetitor?.word_count || '--'}</p>
              <p className="text-[10px] text-on-surface-variant/60 font-bold mt-1 uppercase">Target: ~2,500</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Optimization</p>
              <p className="text-xl font-black text-success uppercase">Dynamic</p>
              <p className="text-[10px] text-on-surface-variant/60 font-bold mt-1 uppercase">AI Assessment</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2 text-on-surface text-sm">
                <Network className="w-4 h-4 text-primary" />
                Content Structure
              </h3>
            </div>
          
          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            {comparison && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <p className="text-[10px] font-bold tracking-widest text-primary uppercase">AI Comparison Result</p>
                <p className="text-sm text-on-surface font-medium">{comparison.summary}</p>
                <button onClick={() => setComparison(null)} className="text-[10px] text-on-surface-variant underline uppercase tracking-widest">Clear</button>
              </div>
            )}
            {selectedCompetitor ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-surface-container rounded-lg border border-outline-variant text-center">
                    <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Word Count</p>
                    <p className="text-3xl font-bold text-primary">{selectedCompetitor.word_count}</p>
                    <p className="text-[9px] text-on-surface-variant/50 mt-1 uppercase">Target: ~2,500</p>
                  </div>
                  <div className="p-4 bg-surface-container rounded-lg border border-outline-variant text-center">
                    <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">Optimization</p>
                    <p className="text-xl font-bold text-on-secondary-container">Dynamic</p>
                    <p className="text-[9px] text-on-surface-variant/50 mt-1 uppercase">AI Assessment</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-2 uppercase">Page Title</p>
                    <div className="p-3 bg-primary-container text-secondary-fixed rounded border border-outline-variant font-mono text-[13px] leading-snug">
                      {selectedCompetitor.page_title}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-2 uppercase">Headings (H1-H3)</p>
                    <div className="space-y-3 pl-4 border-l-2 border-outline-variant max-h-60 overflow-y-auto">
                      {(selectedCompetitor.headings || []).slice(0, 10).map((h: any, i: number) => (
                        <div key={i} className="flex items-start gap-4">
                          <span className="text-[10px] font-black text-on-surface-variant/40 mt-1">{h.type || 'H'}</span>
                          <p className="text-[13px] leading-tight text-on-surface">
                            {h.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-4 flex items-center justify-between uppercase">
                    Extracted FAQ 
                    <span className="bg-secondary text-on-secondary px-2 rounded-full text-[9px] py-0.5 font-black uppercase">Parsed</span>
                  </p>
                  <div className="space-y-2">
                    {(selectedCompetitor.faq_data || []).map((faq: any, i: number) => (
                      <div key={i} className="p-3 bg-surface-container-low border border-outline-variant rounded-lg flex gap-3 items-start hover:border-secondary hover:bg-white transition-all cursor-help group shadow-sm">
                        <HelpCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <p className="text-[13px] font-medium leading-tight text-on-surface group-hover:text-secondary">{faq.question || faq}</p>
                      </div>
                    ))}
                    {(!selectedCompetitor.faq_data || selectedCompetitor.faq_data.length === 0) && (
                      <p className="text-xs text-on-surface-variant opacity-50 italic">No FAQs detected.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant opacity-40">
                <Loader2 className={cn("w-8 h-8 mb-2", loading && "animate-spin")} />
                <p className="text-xs font-bold uppercase tracking-widest">Select a keyword or competitor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Competitor List */}
      <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-on-surface">
              <Grid3X3 className="w-5 h-5 text-on-primary-fixed-variant" fill="currentColor" />
              Competitor Analysis Report
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                  <th className="px-6 py-4">Page Title</th>
                  <th className="px-6 py-4">URL</th>
                  <th className="px-6 py-4">Word Count</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {competitors.map((comp) => (
                  <tr 
                    key={comp.id} 
                    onClick={() => setSelectedCompetitor(comp)}
                    className={cn(
                      "hover:bg-surface-container-low/50 transition-colors group cursor-pointer",
                      selectedCompetitor?.id === comp.id && "bg-surface-container-low"
                    )}
                  >
                    <td className="px-6 py-5 font-bold text-primary max-w-md truncate">{comp.page_title}</td>
                    <td className="px-6 py-5">
                      <a 
                        href={comp.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-primary text-xs hover:underline break-all"
                      >
                        {comp.url}
                      </a>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs font-bold">{comp.word_count}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-1.5 rounded-full hover:bg-surface-container transition-all text-on-surface-variant/40 group-hover:text-primary">
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {competitors.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-on-surface-variant opacity-50 uppercase tracking-widest font-bold">
                      No competitors analyzed for this keyword.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Comparison Results */}
      {comparison && comparison.comparison && (
        <div className="col-span-12 mt-8 bg-primary-container text-on-primary-container p-8 rounded-2xl border-2 border-secondary shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-on-primary-fixed-variant rounded-xl shadow-lg">
                  <Sparkles className="w-5 h-5 text-secondary-fixed fill-secondary-fixed animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-secondary-fixed tracking-tight uppercase">Executive AI SEO Comparison Audit</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">My Site vs {selectedCompetitor?.url || manualCompetitorUrl}</p>
                </div>
              </div>
              <button 
                onClick={exportCompetitors}
                className="flex items-center gap-1.5 bg-white text-accent-color hover:bg-white/95 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>

            {/* Scorecard and Verdict Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
              {/* My Score */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg relative group overflow-hidden flex flex-col justify-center">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-2">My Website SEO Score</p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-white">{comparison.comparison.my_score || 0}</span>
                  <span className="text-sm opacity-50 font-bold">/100</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-4">
                  <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${comparison.comparison.my_score || 0}%` }} />
                </div>
              </div>

              {/* Competitor Score */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-lg relative group overflow-hidden flex flex-col justify-center">
                <div className="absolute inset-0 bg-error/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-[10px] font-black tracking-widest text-error uppercase mb-2">Competitor SEO Score</p>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-white">{comparison.comparison.competitor_score || 0}</span>
                  <span className="text-sm opacity-50 font-bold">/100</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-4">
                  <div className="bg-error h-full rounded-full transition-all duration-1000" style={{ width: `${comparison.comparison.competitor_score || 0}%` }} />
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg md:col-span-2 lg:col-span-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary-fixed fill-secondary-fixed" />
                    <p className="text-[10px] font-black tracking-widest text-secondary-fixed uppercase">SEO Friendliness Verdict</p>
                  </div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-wide">
                    Winner: <span className="text-secondary">{comparison.comparison.seo_verdict || "Under Review"}</span>
                  </h4>
                  <p className="text-xs text-on-primary-container leading-relaxed opacity-90 italic">
                    {comparison.comparison.verdict_reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Structured Differences Table */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl overflow-hidden mb-8">
              <div className="px-6 py-4 bg-white/5 border-b border-white/10">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-fixed">Structured Technical SEO Differences</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-[10px] font-black text-secondary-fixed uppercase tracking-wider">
                      <th className="px-6 py-3.5 border-r border-white/10 w-1/4">Metric</th>
                      <th className="px-6 py-3.5 border-r border-white/10 w-1/4">My Website</th>
                      <th className="px-6 py-3.5 border-r border-white/10 w-1/4">Competitor Site</th>
                      <th className="px-6 py-3.5 w-1/4">AI Assessment & Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-medium text-white/90">
                    {[
                      { label: "Page Title", key: "title" },
                      { label: "Word Count", key: "word_count" },
                      { label: "Heading Structure", key: "headings_outline" },
                      { label: "Meta Description", key: "meta_description" }
                    ].map((row, i) => {
                      const item = comparison.comparison.structured_diff?.[row.key] || {};
                      return (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 border-r border-white/10 font-bold bg-white/5 text-secondary-fixed uppercase tracking-wider text-[9px]">{row.label}</td>
                          <td className="px-6 py-4 border-r border-white/10 break-all">{item.my_site || "N/A"}</td>
                          <td className="px-6 py-4 border-r border-white/10 break-all">{item.competitor || "N/A"}</td>
                          <td className="px-6 py-4 italic text-secondary leading-relaxed bg-white/5">{item.analysis_note || "Analyzing..."}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Action Checklist & Blueprint */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
              {/* Checklist */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-fixed flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                  Required SEO Adjustments Checklist
                </h4>
                <div className="grid gap-3">
                  {Array.isArray(comparison.comparison.actionable_changes) ? (
                    comparison.comparison.actionable_changes.map((change: string, idx: number) => (
                      <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-4 items-start shadow-sm hover:border-secondary transition-all group cursor-pointer">
                        <div className="h-6 w-6 rounded-full bg-secondary-fixed-dim/20 border border-secondary flex items-center justify-center text-[10px] font-black text-secondary shrink-0 group-hover:scale-105 transition-transform">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-primary-container leading-relaxed">
                            {change}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs italic text-on-primary-container opacity-50">No structural changes suggested.</p>
                  )}
                </div>
              </div>

              {/* Blueprints */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-error flex items-center gap-2">
                  <Zap className="w-4 h-4 text-error" />
                  Winning Blueprint
                </h4>
                <div className="bg-on-primary-fixed-variant p-6 rounded-2xl border border-secondary shadow-inner space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-secondary-fixed uppercase mb-2 tracking-widest opacity-60">Winning Action Plan</p>
                    <p className="text-sm font-bold text-secondary-fixed leading-relaxed italic">
                      "{comparison.comparison.winning_action}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[9px] font-black text-secondary-fixed uppercase mb-2 tracking-widest opacity-60">Competitor Advantage Gaps</p>
                    <p className="text-xs leading-relaxed text-on-primary-container opacity-90">
                      {comparison.comparison.competitive_advantages}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setComparison(null)}
              className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Close Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
