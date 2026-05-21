import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowRight,
  TrendingDown,
  BarChart3,
  Cpu,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { cn } from '../lib/utils';
import { fetchKeywords, fetchReports, fetchCompetitors, AnalysisReport } from '../lib/api';

const data = [
  { name: '1', you: 45, avg: 40 },
  { name: '2', you: 52, avg: 42 },
  { name: '3', you: 48, avg: 38 },
  { name: '4', you: 61, avg: 45 },
  { name: '5', you: 55, avg: 40 },
  { name: '6', you: 67, avg: 50 },
  { name: '7', you: 74, avg: 55 },
  { name: '8', you: 68, avg: 52 },
  { name: '9', you: 62, avg: 48 },
  { name: '10', you: 58, avg: 45 },
  { name: '11', you: 65, avg: 50 },
  { name: '12', you: 70, avg: 55 },
  { name: '13', you: 74, avg: 58 },
];

export default function Dashboard({ setActiveTab }: { setActiveTab: (tab: any) => void }) {
  const [keywordCount, setKeywordCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [latestReport, setLatestReport] = useState<AnalysisReport | null>(null);
  const [chartData, setChartData] = useState<any[]>(data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [kws, reps, comps] = await Promise.all([
        fetchKeywords(), 
        fetchReports(),
        fetchCompetitors()
      ]);
      setKeywordCount(kws.length);
      setReportCount(reps.length);
      if (reps.length > 0) setLatestReport(reps[0]);
      
      if (comps.length > 0) {
        // Use real word count data for the chart
        const formattedData = comps.slice(0, 10).map((c: any) => ({
          name: c.page_title.length > 15 ? c.page_title.substring(0, 12) + '...' : c.page_title,
          you: c.word_count,
          avg: 1500 // baseline
        }));
        setChartData(formattedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-primary">Executive Dashboard</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Real-time health monitoring and competitive intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-md">
            <div className="w-2 h-2 rounded-full bg-secondary pulse-glow" />
            <span className="text-[11px] font-bold tracking-wider text-on-surface uppercase">Live Feed Active</span>
          </div>
          <button onClick={loadStats} className="bg-primary text-on-primary px-6 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh Intelligence"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-md group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Tracked Keywords</span>
            <Activity className="w-5 h-5 text-secondary" fill="currentColor" />
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">{keywordCount}</p>
            <div className="flex items-center gap-1 mt-1 text-secondary font-mono text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Active in Intelligence Map</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-md group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Reports Generated</span>
            <Zap className="w-5 h-5 text-error" fill="currentColor" />
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">{reportCount}</p>
            <div className="flex items-center gap-1 mt-1 text-error font-mono text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Full Analysis Completed</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-md group hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Opportunity Score</span>
            <ShieldCheck className="w-5 h-5 text-on-secondary-fixed-variant" fill="currentColor" />
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">
              {reportCount > 0 ? (latestReport?.report_data?.analysis?.depth_analysis?.authority_score || '89') : '--'}/100
            </p>
            <div className="flex items-center gap-1 mt-1 text-secondary font-mono text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{latestReport?.report_data?.analysis?.depth_analysis?.verdict || 'High Potential'} detected</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 opacity-70">
              * Based on competitor content depth and structural complexity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Live Competitive Map */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-md">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Content Authority Map</h3>
                <p className="text-on-surface-variant text-xs font-medium">Comparison of Word Count across Top 10 Competitors</p>
              </div>
            </div>

            <div className="h-[400px] w-full bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 relative p-6 overflow-hidden">
              {!loading && chartData.length > 0 ? (
                <ResponsiveContainer width="99%" height={340} minWidth={0}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid vertical={false} strokeOpacity={0.05} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 9, fontWeight: 700 }} 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      stroke="#8e9199"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fontWeight: 700 }} 
                      stroke="#8e9199"
                      label={{ value: 'Word Count', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontWeight: 800, fill: '#8e9199' } }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1c1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="you" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#006c49' : '#1a1c1e'} 
                          fillOpacity={index === 0 ? 1 : 0.4 + (index * 0.05)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <BarChart3 className="w-12 h-12" />
                  <p className="text-xs font-bold uppercase tracking-widest">Awaiting Analysis Data</p>
                </div>
              )}
              {chartData.length > 0 && (
                <div className="absolute top-4 left-[58%] -translate-x-1/2 bg-on-background text-on-primary-fixed px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-md">
                  Current Visibility
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-primary-container text-on-primary-fixed border border-outline-variant p-6 rounded-md shadow-lg">
            <div className="flex items-center gap-2 mb-8">
              <Cpu className="w-5 h-5 text-secondary-fixed" />
              <h3 className="font-bold text-secondary-fixed">AI Agent Intelligence</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-secondary-fixed-dim">Agent Alpha: Idle</span>
                  <span>100% Ready</span>
                </div>
                <div className="h-1 bg-on-primary-fixed-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-fixed w-full" />
                </div>
                <p className="text-[11px] text-on-primary-container italic">"Systems nominal. Standing by for new keyword targets."</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-md border-l-4 border-secondary">
            <h3 className="font-bold text-on-surface mb-3">Immediate Actions</h3>
            <ul className="space-y-2">
              <li 
                onClick={() => setActiveTab('explorer')}
                className="flex items-center gap-2 text-[13px] text-secondary font-semibold cursor-pointer hover:translate-x-1 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Add 5-10 seed keywords to expand map</span>
              </li>
              <li 
                onClick={() => setActiveTab('brief')}
                className="flex items-center gap-2 text-[13px] text-secondary font-semibold cursor-pointer hover:translate-x-1 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Review the latest AI content brief</span>
              </li>
              <li 
                onClick={() => setActiveTab('lab')}
                className="flex items-center gap-2 text-[13px] text-secondary font-semibold cursor-pointer hover:translate-x-1 transition-transform"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Analyze top competitor structure in Lab</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
