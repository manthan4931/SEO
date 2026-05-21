/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FlaskConical, 
  Network, 
  FileText, 
  Plus, 
  Settings, 
  HelpCircle,
  Bell,
  Bot,
  ShieldCheck,
  SearchCode
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import KeywordExplorer from './components/KeywordExplorer';
import CompetitorLab from './components/CompetitorLab';
import SemanticMap from './components/SemanticMap';
import BriefEngine from './components/BriefEngine';
import IntelligenceChat from './components/IntelligenceChat';

type TabId = 'dashboard' | 'explorer' | 'lab' | 'map' | 'brief' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'explorer', label: 'Keyword Explorer', icon: SearchCode },
    { id: 'lab', label: 'Competitor Lab', icon: FlaskConical },
    { id: 'map', label: 'Semantic Map', icon: Network },
    { id: 'brief', label: 'Brief Engine', icon: FileText },
    { id: 'chat', label: 'Strategy Chat', icon: Bot },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'explorer': return <KeywordExplorer />;
      case 'lab': return <CompetitorLab />;
      case 'map': return <SemanticMap />;
      case 'brief': return <BriefEngine />;
      case 'chat': return <IntelligenceChat />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };


  return (
    <div className="flex min-h-screen bg-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Sidebar Navigation */}
      <aside className="fixed h-full w-[260px] left-0 top-0 bg-primary-container border-r border-outline-variant flex flex-col py-8 px-4 z-50">
        <div className="mb-12 px-2 flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
          <div>
            <h1 className="text-xl leading-none font-bold text-secondary-fixed tracking-tight">SERP Intel</h1>
            <p className="text-[10px] font-bold text-on-primary-container tracking-[0.2em] uppercase mt-1 opacity-60">Vigilance AI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group active:scale-95",
                  isActive 
                    ? "bg-on-primary-fixed-variant text-secondary-fixed border-l-[3px] border-secondary-fixed rounded-l-none" 
                    : "text-on-primary-container opacity-60 hover:opacity-100 hover:bg-on-primary-fixed-variant/50 hover:text-secondary-fixed"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "fill-secondary-fixed/10")} />
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-on-primary-fixed-variant pt-8">
          <button 
            onClick={() => setActiveTab('explorer')}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all mb-8 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-on-primary-container opacity-60 hover:opacity-100 transition-colors group">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-on-primary-container opacity-60 hover:opacity-100 transition-colors group">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Support</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-[260px] flex flex-col">
        {/* Top App Bar */}
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-focus-within:text-secondary transition-colors" />
              <input 
                type="text" 
                placeholder="Search keywords, domains, or intelligence..."
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full pl-12 pr-6 py-2 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative group">
                <Bell className="w-5 h-5 group-hover:shake" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-error rounded-full ring-2 ring-surface" />
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
              >
                <Bot className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-outline-variant" />
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface group-hover:text-secondary transition-colors">Alex Rivera</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Senior Intelligence Lead</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden group-hover:border-secondary transition-all">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBhCxZE4ViYfR1WjCoCCcuNJi-Ei_3KpzybPBQxwfCnqJ0hnexLA5wcCB8RRRBgn_BcjHk3ZrblK7PL2ThGkn3QVeOSV_van0zhi9Z_JFQKyRltlY0jvn2YE9Sz7hGfKThBMr_zWZ2sPYDgxKrNxGloapQ2TvXiy4QlyszA5dbv7Q2Y2IRPs5i7TMQSflSY-SDl7ZbVOgPZUwkVPEqJLefL6n8FdsTnOJxYbelIa3RgDGtvGXONVwJNk5qh_fUsiNaKQtEGQVl5UA" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8 max-w-[1440px] mx-auto w-full flex-1">
          <div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
