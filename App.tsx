import React, { useState } from 'react';
import { StartOverlay } from './components/StartOverlay';
import AdhdGenerator from './components/AdhdGenerator';
import FocusGenerator from './components/FocusGenerator';
import ControlBar from './components/ControlBar';
import { GeneratorType } from './types';
import { Brain, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GeneratorType>(GeneratorType.ADHD);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans selection:bg-indigo-500/30">
      <StartOverlay />
      
      {/* Header */}
      <header className="pt-8 pb-4 text-center px-4">
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 mb-2">
          NeuroFlow
        </h1>
        <p className="text-slate-400 text-sm">Targeted Psychoacoustics</p>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 pb-32">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/50 p-1 rounded-full border border-slate-700 inline-flex">
            <button
              onClick={() => setActiveTab(GeneratorType.ADHD)}
              className={`flex items-center px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === GeneratorType.ADHD
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              ADHD / Grounding
            </button>
            <button
              onClick={() => setActiveTab(GeneratorType.NEUROTYPICAL)}
              className={`flex items-center px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === GeneratorType.NEUROTYPICAL
                  ? 'bg-indigo-900/50 text-indigo-100 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Focus / Flow
            </button>
          </div>
        </div>

        {/* Generator Views */}
        <div className="relative">
          {activeTab === GeneratorType.ADHD ? (
            <AdhdGenerator />
          ) : (
            <FocusGenerator />
          )}
        </div>

      </main>

      <ControlBar />
    </div>
  );
};

export default App;