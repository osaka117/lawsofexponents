import React, { useState } from 'react';
import { MockTestConfigState } from '../types';
import { TOPICS } from '../math/topics';

interface MockTestConfigProps {
  initialConfig: MockTestConfigState;
  onStart: (config: MockTestConfigState) => void;
  onBack: () => void;
}

export const MockTestConfig: React.FC<MockTestConfigProps> = ({
  initialConfig,
  onStart,
  onBack
}) => {
  const [questionCount, setQuestionCount] = useState<number>(initialConfig.questionCount);
  const [customCountInput, setCustomCountInput] = useState<string>(
    [5, 10, 15, 20, 25, 30].includes(initialConfig.questionCount)
      ? ''
      : String(initialConfig.questionCount)
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialConfig.selectedTopics);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presetCounts = [5, 10, 15, 20, 25, 30];

  const handleSelectCount = (count: number) => {
    setQuestionCount(count);
    setCustomCountInput('');
    setErrorMsg(null);
  };

  const handleCustomCountChange = (val: string) => {
    setCustomCountInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setQuestionCount(num);
      setErrorMsg(null);
    }
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setErrorMsg(null);
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics(TOPICS.map(t => t.id));
    setErrorMsg(null);
  };

  const handleClearAllTopics = () => {
    setSelectedTopics([]);
    setErrorMsg(null);
  };

  const handleStart = () => {
    if (selectedTopics.length === 0) {
      setErrorMsg('Please select at least one topic for the mock test.');
      return;
    }
    if (questionCount < 1 || questionCount > 50) {
      setErrorMsg('Please enter a valid question count between 1 and 50.');
      return;
    }

    onStart({
      questionCount,
      selectedTopics
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#e6edf3]">
      <div className="bg-[#161b22] retro-box p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#30363d] pb-4 mb-6 gap-3">
          <div>
            <div className="font-mono-code text-[11px] uppercase tracking-wider text-[#d97706] font-bold">
              Examination Console
            </div>
            <h1 className="font-pixel text-xl sm:text-2xl text-[#f0f6fc]">
              MOCK TEST SETUP
            </h1>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-mono-code uppercase bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
          >
            ← Back to Practice
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-[#490202] border-2 border-[#da3633] text-[#f85149] font-mono-code text-xs font-bold">
            [ERROR] {errorMsg}
          </div>
        )}

        {/* 1. Question Count Selection */}
        <div className="mb-8">
          <h2 className="font-pixel text-xs sm:text-sm text-[#f0f6fc] mb-3">
            1. NUMBER OF QUESTIONS
          </h2>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {presetCounts.map(count => {
              const isSelected = questionCount === count && customCountInput === '';
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleSelectCount(count)}
                  className={`px-4 py-2 font-mono-code text-xs uppercase font-bold border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d97706] text-[#0f1215] border-[#f59e0b] shadow-[2px_2px_0px_#050709] font-extrabold'
                      : 'bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d] hover:text-white'
                  }`}
                >
                  {count} Questions
                </button>
              );
            })}
          </div>

          {/* Custom Question Count */}
          <div className="flex items-center gap-3">
            <span className="font-mono-code text-xs text-[#8b949e]">Or custom amount (1–50):</span>
            <input
              type="number"
              min="1"
              max="50"
              placeholder="e.g. 12"
              value={customCountInput}
              onChange={e => handleCustomCountChange(e.target.value)}
              className="w-24 px-3 py-1.5 font-mono-code text-xs bg-[#0d1117] border-2 border-[#30363d] text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#d97706]"
            />
            {customCountInput && !isNaN(parseInt(customCountInput, 10)) && (
              <span className="font-mono-code text-xs text-[#34d399] font-bold">
                ✓ {parseInt(customCountInput, 10)} selected
              </span>
            )}
          </div>
        </div>

        {/* 2. Topic Selection */}
        <div className="mb-8 border-t-2 border-[#30363d] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-pixel text-xs sm:text-sm text-[#f0f6fc]">
              2. TEST TOPICS ({selectedTopics.length}/{TOPICS.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] border border-[#30363d] hover:bg-[#d97706] hover:text-[#0f1215] transition-colors cursor-pointer"
              >
                SELECT ALL
              </button>
              <button
                type="button"
                onClick={handleClearAllTopics}
                className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:text-white transition-colors cursor-pointer"
              >
                CLEAR ALL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {TOPICS.map((topic, idx) => {
              const isChecked = selectedTopics.includes(topic.id);
              return (
                <label
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex items-start gap-3 p-2.5 border-2 cursor-pointer select-none transition-colors ${
                    isChecked
                      ? 'bg-[#2b1d07] border-[#d97706] text-[#f0f6fc]'
                      : 'bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:bg-[#282e36]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 accent-[#d97706] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-mono-code text-xs font-bold">
                      {idx + 1}. {topic.name}
                    </div>
                    <div className="font-mono-code text-[11px] text-[#8b949e]">
                      {topic.shortDesc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. Automatic Difficulty Distribution Notice */}
        <div className="mb-8 border-t-2 border-[#30363d] pt-6">
          <div className="p-4 bg-[#0d1117] border-2 border-[#30363d]">
            <div className="font-pixel text-xs text-[#d97706] mb-1">
              AUTOMATIC DIFFICULTY DISTRIBUTION (LEVELS 1–5)
            </div>
            <p className="font-mono-code text-xs text-[#c9d1d9] leading-relaxed">
              Per examination specifications, there is <strong>no manual difficulty selection</strong> in Mock Test Mode. Every question is assigned an independent random difficulty from Level 1 to Level 5 (no progression from easy to hard). Level 5 questions retain full deep reasoning complexity.
            </p>
            <div className="mt-2 text-[11px] font-mono-code text-[#8b949e]">
              Solutions and scores are held confidentially until you submit the test. You can freely navigate and change answers during the exam.
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t-2 border-[#30363d] pt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 font-mono-code text-xs uppercase bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
          >
            ← Return to Practice
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-3 font-pixel text-xs sm:text-sm bg-[#d97706] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
          >
            BEGIN MOCK TEST ({questionCount} QUESTIONS) →
          </button>
        </div>
      </div>
    </div>
  );
};
