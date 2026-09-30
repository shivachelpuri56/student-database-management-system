import React from 'react';
import { Plus, RotateCcw, Database, Sparkles, Terminal } from 'lucide-react';
import { SystemHealth } from '../types.ts';

interface NavbarProps {
  activeTab: 'dashboard' | 'students' | 'analytics' | 'chat' | 'docs';
  setActiveTab: (tab: 'dashboard' | 'students' | 'analytics' | 'chat' | 'docs') => void;
  onOpenAddModal: () => void;
  onReseed: () => void;
  isReseeding: boolean;
  health: SystemHealth | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onReseed,
  isReseeding,
  health
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            StudentDB + Conversational AI
          </span>
        </div>

        {/* Zone 2: 4-5 Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions & System Indicators */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onReseed}
            disabled={isReseeding}
            title="Reset database to 30 synthetic demonstration records"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>Reseed</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>

          {/* Real-time Health dot */}
          <div
            className="hidden lg:flex items-center gap-1.5 pl-2 text-xs text-slate-400 border-l border-slate-800"
            title={health ? `Status: ${health.status} · Records: ${health.database.total_students} · AI: ${health.ai_engine.model}` : 'Connecting...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {health?.database.total_students ?? 30} students
            </span>
          </div>
        </div>

      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 ${activeTab === 'dashboard' ? 'text-white font-medium' : 'text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-2 py-1 ${activeTab === 'students' ? 'text-white font-medium' : 'text-slate-400'}`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2 py-1 ${activeTab === 'analytics' ? 'text-white font-medium' : 'text-slate-400'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2 py-1 font-medium ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-2 py-1 ${activeTab === 'docs' ? 'text-white font-medium' : 'text-slate-400'}`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
