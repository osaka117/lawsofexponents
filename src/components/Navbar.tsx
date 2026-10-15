import React from 'react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  onOpenReference: () => void;
  onOpenDeployGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onNavigate,
  onOpenReference,
  onOpenDeployGuide
}) => {
  return (
    <header className="bg-[#161b22] border-b-2 border-[#30363d] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Zone */}
        <button
          onClick={() => onNavigate('practice')}
          className="flex items-center gap-2 text-left cursor-pointer group"
          title="Return to Practice Reviewer"
        >
          <div className="w-8 h-8 bg-[#10b981] border-2 border-[#30363d] flex items-center justify-center text-[#0f1215] font-pixel text-xs shadow-[2px_2px_0px_#050709] font-extrabold">
            Xⁿ
          </div>
          <div>
            <div className="font-pixel text-xs tracking-tight text-[#f0f6fc] group-hover:text-[#34d399] transition-colors">
              MATH REVIEWER
            </div>
            <div className="text-[10px] font-mono-code text-[#8b949e] tracking-wider uppercase">
              Laws of Exponents
            </div>
          </div>
        </button>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => onNavigate('practice')}
            className={`px-3 py-1.5 text-xs font-mono-code uppercase font-bold transition-all ${
              currentMode === 'practice'
                ? 'bg-[#10b981] text-[#0f1215] retro-box-sm font-extrabold'
                : 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white'
            }`}
          >
            Practice
          </button>

          <button
            onClick={() => onNavigate('mock-config')}
            className={`px-3 py-1.5 text-xs font-mono-code uppercase font-bold transition-all ${
              currentMode === 'mock-config' || currentMode === 'mock-active' || currentMode === 'mock-results'
                ? 'bg-[#d97706] text-[#0f1215] retro-box-sm font-extrabold'
                : 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white'
            }`}
          >
            Mock Test
          </button>

          <div className="h-5 w-[1px] bg-[#30363d] hidden sm:block mx-1" />

          <button
            onClick={onOpenReference}
            className="px-2.5 py-1.5 text-xs font-mono-code bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#10b981] hover:text-[#0f1215] transition-colors"
            title="Open Laws of Exponents Summary Formula Guide"
          >
            Rules Guide
          </button>

          <button
            onClick={onOpenDeployGuide}
            className="px-2.5 py-1.5 text-xs font-mono-code bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white transition-colors"
            title="GitHub Pages Deployment Instructions"
          >
            GitHub Pages
          </button>
        </nav>
      </div>
    </header>
  );
};
