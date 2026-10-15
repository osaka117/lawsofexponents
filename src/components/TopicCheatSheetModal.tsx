import React from 'react';
import { TOPICS } from '../math/topics';
import { MathView } from './MathView';

interface TopicCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopicCheatSheetModal: React.FC<TopicCheatSheetModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161b22] retro-box p-6 max-w-3xl w-full my-8 max-h-[90vh] flex flex-col text-[#e6edf3]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#30363d] pb-3 mb-4 shrink-0">
          <div>
            <div className="font-mono-code text-[10px] text-[#34d399] font-bold uppercase">
              Reference Manual
            </div>
            <h2 className="font-pixel text-sm sm:text-base text-[#f0f6fc]">
              THE 9 LAWS OF EXPONENTS QUICK GUIDE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-mono-code text-sm font-bold bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#e6edf3] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {TOPICS.map((topic, idx) => (
            <div
              key={topic.id}
              className="p-3.5 bg-[#0d1117] border border-[#30363d] text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono-code text-xs font-bold text-[#34d399]">
                  {idx + 1}. {topic.name}
                </span>
                {topic.domainNotes && (
                  <span className="text-[10px] font-mono-code text-[#f87171] bg-[#490202] px-1.5 py-0.5 border border-[#da3633]">
                    Restriction: {topic.domainNotes}
                  </span>
                )}
              </div>

              <div className="p-2 bg-[#161b22] border border-[#30363d] text-center my-2">
                <MathView math={topic.ruleFormula} display={true} className="text-base text-[#58a6ff]" />
              </div>

              <p className="font-mono-code text-xs text-[#c9d1d9] mb-2 leading-relaxed">
                {topic.shortDesc}
              </p>

              <div className="text-[11px] font-mono-code bg-[#161b22] p-2 border border-[#30363d] text-[#e6edf3]">
                <span className="font-bold text-[#f0f6fc]">Example: </span>
                <MathView math={topic.example} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-[#30363d] flex justify-end shrink-0 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 font-pixel text-xs bg-[#10b981] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
          >
            CLOSE REFERENCE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
