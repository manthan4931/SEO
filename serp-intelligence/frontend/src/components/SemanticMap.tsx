import React from 'react';
import { 
  Network, 
  Search, 
  Bell, 
  Bot, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Globe, 
  Workflow, 
  Copy, 
  Info, 
  HelpCircle, 
  ArrowRightLeft, 
  Download,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

import { fetchReports, AnalysisReport } from '../lib/api';

export default function SemanticMap() {
  const [reports, setReports] = React.useState<AnalysisReport[]>([]);
  const [selectedReportId, setSelectedReportId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Live refresh every 10s
    return () => clearInterval(interval);
  }, [reports.length, selectedReportId]);

  const loadData = async () => {
    try {
      const data = await fetchReports();
      if (Array.isArray(data)) {
        setReports(data);
        if (data.length > 0) {
          if (selectedReportId === null || data.length > reports.length) {
            setSelectedReportId(data[0].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const report = reports.find(r => r.id === selectedReportId) || reports[0] || null;

  const clusterData = report?.report_data?.analysis?.cluster_analysis || {
    clusters: [],
    missing_angles: [],
    semantic_map_data: { nodes: [], edges: [] }
  };
  const faqData = report?.report_data?.analysis?.faq_analysis || [];
  const paaData = report?.report_data?.analysis?.paa_questions || [];

  const faqColumns = [
    { 
      title: 'Search Intent (Google PAA)', 
      icon: Search, 
      items: paaData.slice(0, 4).map((q: string) => ({
        title: q,
        src: 'Real-time: "People Also Ask"',
        color: 'bg-secondary'
      }))
    },
    { 
      title: 'Competitor Knowledge Gaps', 
      icon: HelpCircle, 
      items: faqData.filter((f: any) => f.category === 'Informational').slice(0, 4).map((f: any) => ({
        title: f.question,
        src: `Source: ${f.source || 'Competitor Page'}`,
        color: 'bg-primary'
      }))
    },
    { 
      title: 'Commercial & Conversion Intent', 
      icon: ArrowRightLeft, 
      items: faqData.filter((f: any) => f.category !== 'Informational').slice(0, 4).map((f: any) => ({
        title: f.question,
        src: 'High Intent Strategic Opportunity',
        color: 'bg-error'
      }))
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase mb-1.5 opacity-60">
            <span>Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary opacity-100">Semantic Cluster Map</span>
          </nav>
          <h3 className="text-2xl font-bold text-on-surface tracking-tight">Step 05-07: Semantic Architecture</h3>
          <div className="flex items-center gap-4 mt-2">
            <select 
              value={selectedReportId || ''} 
              onChange={(e) => setSelectedReportId(Number(e.target.value))}
              className="bg-surface-container border border-outline-variant rounded-md px-3 py-1.5 text-sm font-bold outline-none focus:ring-1 focus:ring-secondary"
            >
              {reports.map(rep => <option key={rep.id} value={rep.id}>{rep.keyword_text}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-surface-container-low p-2 px-4 rounded-lg border border-outline-variant shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-secondary-fixed-dim pulse-glow shadow-[0_0_15px_rgba(78,222,163,0.5)]" />
            <span className="text-[13px] font-black text-on-surface uppercase tracking-tight">AI Agent: Vigilance-4 Active</span>
          </div>
          <div className="h-5 w-px bg-outline-variant" />
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">Scraping Progress</span>
            <div className="w-32 h-1.5 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
              <div className="w-[85%] h-full bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <span className="font-mono text-xs font-black text-primary">85%</span>
          </div>
        </div>
      </section>

      {/* Main Container Grid */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Topic Cluster Map Visualization */}
        <div className="col-span-12 lg:col-span-8 h-[600px] bg-white rounded-xl border border-outline-variant relative overflow-hidden shadow-md group">
          {/* Controls Overlay */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
            <h4 className="text-lg font-bold text-on-surface tracking-tight">Topic Cluster Map</h4>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold tracking-widest rounded-md uppercase">{clusterData.clusters.length} Clusters Identified</span>
              <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[11px] font-bold tracking-widest rounded-md uppercase border border-outline-variant/30">High Relevance</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-xs leading-relaxed">
              This map visualizes semantic relationships between competitor topics. Clusters represent high-density content areas, while "Missing Angles" highlight untapped SEO opportunities.
            </p>
          </div>
          
          <div className="absolute top-6 right-6 z-10 flex gap-1.5">
            {[ZoomIn, ZoomOut, Maximize].map((Icon, i) => (
              <button key={i} className="p-2.5 bg-white border border-outline-variant hover:bg-surface-container-low rounded-lg transition-all shadow-sm hover:scale-105 active:scale-95 group">
                <Icon className="w-4 h-4 text-on-surface-variant group-hover:text-primary" />
              </button>
            ))}
          </div>

          {/* Visualization Canvas Body */}
          <div className="absolute inset-0 flex items-center justify-center p-12 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] bg-[size:48px_48px]">
            <div className="relative w-full h-full">
              {/* Dynamic SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                {(clusterData.semantic_map_data.edges || []).map((edge: any, i: number) => {
                  const nodeA = clusterData.semantic_map_data.nodes.find((n: any) => n.id === edge[0]);
                  const nodeB = clusterData.semantic_map_data.nodes.find((n: any) => n.id === edge[1]);
                  if (!nodeA || !nodeB) return null;
                  return (
                    <line 
                      key={i} 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      x1={`${nodeA.x}%`} 
                      x2={`${nodeB.x}%`} 
                      y1={`${nodeA.y}%`} 
                      y2={`${nodeB.y}%`} 
                      strokeDasharray="8,8" 
                    />
                  );
                })}
              </svg>

              {/* Central Primary Node (Optional, or just use clusters) */}
              {clusterData.semantic_map_data.nodes.length === 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group/center cursor-pointer z-10">
                  <div className="w-44 h-44 rounded-full border-2 border-dashed border-secondary-fixed-dim/40 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                    <div className="w-px h-full bg-secondary-fixed/5" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Generating Semantic Map...</p>
                  </div>
                </div>
              )}

              {/* Dynamic Cluster Nodes */}
              {(clusterData.semantic_map_data.nodes || []).map((node: any) => (
                <div 
                  key={node.id} 
                  className="absolute group/node cursor-pointer z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="w-24 h-24 bg-surface-container-highest rounded-2xl border-2 border-primary flex items-center justify-center flex-col shadow-xl transition-all hover:scale-110 hover:-rotate-3">
                    <span className="text-primary font-black text-[10px] uppercase tracking-widest text-center px-2 leading-tight">{node.label}</span>
                    <span className="text-on-surface-variant text-[9px] font-mono font-bold mt-1 opacity-50">Node {node.id}</span>
                  </div>
                  <div className="absolute top-full mt-4 w-40 bg-on-background text-white p-3 border border-outline-variant shadow-2xl rounded-lg opacity-0 translate-y-2 group-hover/node:opacity-100 group-hover/node:translate-y-0 transition-all z-30 pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-fixed-dim border-b border-white/10 pb-1.5 mb-1.5">Node Intelligence</p>
                    <p className="text-[11px] opacity-80 leading-snug">Semantic connection identified by Vigilance AI.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 border border-outline-variant shadow-lg rounded-xl">
            <div className="flex flex-col gap-2.5">
              {clusterData.clusters.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-md bg-secondary-container border border-secondary" />
                  <span className="text-[11px] font-bold text-on-surface uppercase tracking-widest">{c.name} ({c.density})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Title Pattern Analysis (Right Side) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-outline-variant flex flex-col h-[600px] shadow-md">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
            <div>
              <h4 className="text-lg font-bold text-on-surface tracking-tight leading-none">Title Pattern Analysis</h4>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1.5 opacity-60">Top Performing Formulas</p>
            </div>
            <Workflow className="w-5 h-5 text-primary opacity-40 shrink-0" />
          </div>
          <div className="flex-grow overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {[
              { eff: '94%', formula: 'The [Target Keyword]: [Benefit] Guide for [Year]', meta: ['Used by 8/10 Top Results', 'Avg. CTR 4.8%'], primary: true },
              { eff: '72%', formula: '[Number] Best [Keyword] for [Audience] (Tested)', meta: ['Common in Listicles'] },
              { eff: '68%', formula: 'Why [Keyword] is the Key to [Desired Outcome]', meta: ['High Social Shares'] }
            ].map((p, i) => (
              <div key={i} className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl group hover:border-secondary hover:shadow-sm transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className={cn(
                    "text-[10px] font-black px-2.5 py-1 rounded shadow-sm tracking-wider uppercase",
                    p.primary ? "bg-secondary-container text-on-secondary-container border border-secondary/10" : "bg-surface-container-highest text-primary border border-primary/5"
                  )}>
                    {p.eff} Efficiency
                  </span>
                  <Copy className="w-4 h-4 text-outline group-hover:text-secondary transition-colors" />
                </div>
                <p className="font-bold text-on-surface leading-snug mb-3">{p.formula}</p>
                <div className="flex flex-wrap gap-2">
                  {p.meta.map((m, j) => (
                    <span key={j} className="text-[10px] font-bold bg-surface-container border border-outline-variant/10 px-2 py-1 rounded text-on-surface-variant tracking-tight uppercase">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-5 bg-primary-container text-on-primary-container rounded-xl border border-secondary-fixed/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative flex items-start gap-4 mb-3">
                <div className="p-2 bg-on-primary-fixed-variant rounded-lg border border-secondary-fixed/20 shadow-lg">
                  <Sparkles className="w-4 h-4 text-secondary-fixed fill-secondary-fixed" />
                </div>
                <span className="font-black text-[11px] text-secondary-fixed uppercase tracking-widest mt-1.5 underline underline-offset-4 decoration-secondary-fixed/30">Intelligence Note</span>
              </div>
              {clusterData.missing_angles.map((a: any, i: number) => (
                <p key={i} className="text-[13px] leading-relaxed text-on-primary-container/80 font-medium mb-2">
                  <strong className="text-secondary-fixed">{a.angle}:</strong> {a.reason}
                </p>
              ))}
              {clusterData.missing_angles.length === 0 && (
                <p className="text-[13px] leading-relaxed text-on-primary-container/80 font-medium">
                  Scanning for semantic gaps...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Bank (Bottom Row Full Width) */}
        <div className="col-span-12 bg-white rounded-xl border border-outline-variant shadow-md overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div className="flex items-center gap-8">
              <h4 className="text-lg font-bold text-on-surface tracking-tight">FAQ Bank</h4>
              <div className="flex gap-2">
                {['All Intent', 'Informational', 'Commercial', 'Transactional'].map((tab, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase transition-all shadow-sm",
                      i === 0 ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2 border border-outline-variant rounded-lg text-[11px] font-black tracking-widest uppercase hover:bg-white hover:border-primary transition-all shadow-sm active:scale-95">
              <Download className="w-4 h-4" />
              Export to Brief
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-outline-variant/30">
            {/* FAQ Columns */}
            {faqColumns.map((col, i) => (
              <div key={i} className="p-6 transition-colors hover:bg-surface-container-low/20">
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <col.icon className="w-5 h-5 opacity-40 shrink-0" />
                  <span className="font-black text-[11px] uppercase tracking-widest">{col.title}</span>
                </div>
                <div className="space-y-6">
                  {col.items.length > 0 ? col.items.map((item, j) => (
                    <div key={j} className="group flex gap-4 cursor-pointer">
                      <span className={cn("mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125", item.color)} />
                      <div>
                        <p className="font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-[11px] font-medium text-on-surface-variant opacity-60 mt-1 uppercase tracking-tighter">{item.src}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
                      Awaiting Intelligence...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action FAB */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-40">
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
        <div className="absolute right-full mr-6 px-5 py-2.5 bg-primary-container text-secondary-fixed rounded-xl border-2 border-secondary-fixed opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap pointer-events-none text-[11px] font-black uppercase tracking-widest shadow-2xl">
          Generate AI Content Brief
        </div>
      </button>
    </div>
  );
}
