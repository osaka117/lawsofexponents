import React, { useState } from 'react';
import { MockTestResult } from '../types';
import { MathView } from './MathView';

interface MockTestResultsProps {
  result: MockTestResult;
  onRetakeTest: () => void;
  onReturnHome: () => void;
  onPracticeMissedTopics?: (topicIds: string[]) => void;
}

export const MockTestResults: React.FC<MockTestResultsProps> = ({
  result,
  onRetakeTest,
  onReturnHome,
  onPracticeMissedTopics
}) => {
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(
    new Set(result.questions.map(q => q.id))
  );
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');

  const toggleExpand = (id: string) => {
    setExpandedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedQuestionIds(new Set(result.questions.map(q => q.id)));
  };

  const handleCollapseAll = () => {
    setExpandedQuestionIds(new Set());
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  // Identify missed topics for targeted remediation
  const missedTopicsMap = new Map<string, string>();
  result.questions.forEach((q, idx) => {
    if (result.userAnswers[idx] !== q.correctIndex) {
      missedTopicsMap.set(q.topicId, q.topicName);
    }
  });
  const missedTopicIds = Array.from(missedTopicsMap.keys());

  const filteredQuestions = result.questions
    .map((q, idx) => ({
      question: q,
      index: idx,
      userAnsIdx: result.userAnswers[idx],
      isCorrect: result.userAnswers[idx] === q.correctIndex
    }))
    .filter(item => {
      if (filterMode === 'incorrect') return !item.isCorrect;
      if (filterMode === 'correct') return item.isCorrect;
      return true;
    });

  const getScoreSummaryRating = (pct: number) => {
    if (pct >= 90) return { label: 'EXCELLENT MASTERY', color: 'text-[#34d399]' };
    if (pct >= 75) return { label: 'SOLID PROFICIENCY', color: 'text-[#60a5fa]' };
    if (pct >= 50) return { label: 'INTERMEDIATE PROGRESS', color: 'text-[#fbbf24]' };
    return { label: 'NEEDS TARGETED REVIEW', color: 'text-[#f87171]' };
  };

  const rating = getScoreSummaryRating(result.scorePercentage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#e6edf3]">
      {/* Test Complete Header Box */}
      <div className="bg-[#161b22] retro-box p-6 sm:p-8 mb-8 text-center">
        <div className="inline-block px-3 py-1 bg-[#21262d] text-[#c9d1d9] font-mono-code text-xs uppercase tracking-widest mb-3 border border-[#30363d]">
          OFFICIAL EXAMINATION TRANSCRIPT
        </div>

        <h1 className="font-pixel text-2xl sm:text-3xl text-[#f0f6fc] mb-2">
          TEST COMPLETE
        </h1>

        <div className={`font-pixel text-xs sm:text-sm tracking-wider uppercase mb-6 ${rating.color}`}>
          {rating.label}
        </div>

        {/* Score Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-6">
          <div className="p-4 bg-[#0d1117] border-2 border-[#30363d]">
            <div className="font-mono-code text-xs uppercase text-[#8b949e] font-bold">
              Correct Answers
            </div>
            <div className="font-pixel text-2xl text-[#34d399] mt-1">
              {result.correctCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] border-2 border-[#30363d]">
            <div className="font-mono-code text-xs uppercase text-[#8b949e] font-bold">
              Incorrect / Skipped
            </div>
            <div className="font-pixel text-2xl text-[#f87171] mt-1">
              {result.incorrectCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] border-2 border-[#30363d]">
            <div className="font-mono-code text-xs uppercase text-[#8b949e] font-bold">
              Accuracy Score
            </div>
            <div className="font-pixel text-2xl text-[#f0f6fc] mt-1">
              {result.scorePercentage}%
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#30363d]">
          <button
            onClick={onRetakeTest}
            className="px-5 py-2.5 font-pixel text-xs bg-[#d97706] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
          >
            RETAKE TEST (NEW QUESTIONS) ↵
          </button>

          {onPracticeMissedTopics && missedTopicIds.length > 0 && (
            <button
              onClick={() => onPracticeMissedTopics(missedTopicIds)}
              className="px-5 py-2.5 font-pixel text-xs bg-[#10b981] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
            >
              PRACTICE MISSED TOPICS ({missedTopicIds.length}) →
            </button>
          )}

          <button
            onClick={onReturnHome}
            className="px-4 py-2 font-mono-code text-xs uppercase bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
          >
            Return to Practice
          </button>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="bg-[#161b22] retro-box p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#30363d] pb-4 mb-6 gap-3">
          <div>
            <h2 className="font-pixel text-sm sm:text-base text-[#f0f6fc]">
              DETAILED QUESTION REVIEW & STEP-BY-STEP DERIVATIONS
            </h2>
            <p className="font-mono-code text-xs text-[#8b949e] mt-0.5">
              Review your answers, verify exponent rules, and explore complete procedural solutions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="font-mono-code text-xs uppercase font-bold text-[#8b949e] mr-1">
            Filter View:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 font-mono-code text-xs font-bold uppercase border cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#38bdf8] text-[#0f1215] border-[#38bdf8] font-extrabold'
                : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
            }`}
          >
            All Questions ({result.totalQuestions})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1 font-mono-code text-xs font-bold uppercase border cursor-pointer ${
              filterMode === 'incorrect'
                ? 'bg-[#da3633] text-white border-[#f85149] font-extrabold'
                : 'bg-[#21262d] text-[#f87171] border-[#30363d] hover:bg-[#3c1e1e]'
            }`}
          >
            Incorrect ({result.incorrectCount})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-3 py-1 font-mono-code text-xs font-bold uppercase border cursor-pointer ${
              filterMode === 'correct'
                ? 'bg-[#238636] text-[#34d399] border-[#238636] font-extrabold'
                : 'bg-[#21262d] text-[#34d399] border-[#30363d] hover:bg-[#0e4429]'
            }`}
          >
            Correct ({result.correctCount})
          </button>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-6">
          {filteredQuestions.map(({ question: q, index: idx, userAnsIdx, isCorrect }) => {
            const isExpanded = expandedQuestionIds.has(q.id);
            const userChoiceLetter = userAnsIdx !== null ? optionLetters[userAnsIdx] : 'None (Skipped)';
            const correctChoiceLetter = optionLetters[q.correctIndex];

            return (
              <div
                key={q.id}
                className={`border-2 transition-all ${
                  isCorrect
                    ? 'border-[#238636] bg-[#0c1914]'
                    : 'border-[#da3633] bg-[#1a0f0f]'
                }`}
              >
                {/* Summary Header (Always Visible) */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className={`p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none ${
                    isCorrect ? 'bg-[#0e4429]/50' : 'bg-[#490202]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-pixel text-xs px-2 py-1 ${
                        isCorrect
                          ? 'bg-[#10b981] text-[#0f1215] font-extrabold'
                          : 'bg-[#da3633] text-white font-extrabold'
                      }`}
                    >
                      {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                    </span>
                    <span className="font-mono-code text-xs font-bold text-[#f0f6fc]">
                      Question {idx + 1}: {q.topicName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono-code text-[11px] bg-[#21262d] text-[#c9d1d9] px-2 py-0.5 border border-[#30363d]">
                      Level {q.difficulty}
                    </span>
                    <span className="font-mono-code text-xs font-bold text-[#8b949e]">
                      {isExpanded ? '▲ Hide Solution' : '▼ View Solution'}
                    </span>
                  </div>
                </div>

                {/* Question Details Banner */}
                <div className="p-4 sm:p-6 border-t border-[#30363d]">
                  <p className="font-mono-code text-xs text-[#c9d1d9] mb-3">
                    {q.promptText}
                  </p>

                  <div className="p-3 bg-[#0d1117] border border-[#30363d] text-center mb-4 overflow-x-auto">
                    <MathView math={q.expressionLatex} display={true} className="text-lg text-[#f0f6fc]" />
                  </div>

                  {/* Answers Comparison Pill Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div
                      className={`p-2.5 border font-mono-code text-xs flex items-center justify-between gap-2 ${
                        isCorrect
                          ? 'bg-[#0e4429] border-[#238636] text-[#34d399]'
                          : 'bg-[#490202] border-[#da3633] text-[#f87171]'
                      }`}
                    >
                      <span>Your Answer:</span>
                      <span className="font-bold flex items-center gap-1 text-white">
                        Option {userChoiceLetter}
                        {userAnsIdx !== null && (
                          <span className="ml-1 inline-block">
                            (<MathView math={q.options[userAnsIdx].latex} />)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#0e4429] border border-[#238636] text-[#34d399] font-mono-code text-xs flex items-center justify-between gap-2">
                      <span>Correct Answer:</span>
                      <span className="font-bold flex items-center gap-1 text-white">
                        Option {correctChoiceLetter}
                        <span className="ml-1 inline-block">
                          (<MathView math={q.options[q.correctIndex].latex} />)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Expanded Procedural Solution */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t-2 border-[#30363d]">
                      <div className="font-mono-code text-[11px] uppercase font-bold text-[#34d399] mb-1">
                        Governing Exponent Law:
                      </div>
                      <div className="p-2.5 bg-[#0d1117] border border-[#30363d] text-center mb-4">
                        <MathView math={q.ruleSummary} display={true} className="text-sm text-[#58a6ff]" />
                      </div>

                      <div className="font-mono-code text-xs uppercase font-bold text-[#f0f6fc] mb-2">
                        Procedural Step-by-Step Solution:
                      </div>
                      <div className="space-y-2 mb-4">
                        {q.solutionSteps.map(step => (
                          <div
                            key={step.step}
                            className="p-3 bg-[#161b22] border border-[#30363d]"
                          >
                            <div className="font-mono-code text-xs font-bold text-[#34d399] mb-1">
                              Step {step.step}: {step.title}
                            </div>
                            <div className="py-1 px-2 bg-[#0d1117] border border-[#30363d] text-center my-1.5 overflow-x-auto">
                              <MathView math={step.latex} className="text-[#f0f6fc]" />
                            </div>
                            <p className="font-mono-code text-xs text-[#c9d1d9] leading-relaxed">
                              {step.explanation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Error Diagnosis if student was wrong */}
                      {!isCorrect && (
                        <div className="p-3 bg-[#2b1d07] border border-[#d29922] text-[#fbbf24] font-mono-code text-xs mb-2">
                          <div className="font-bold uppercase mb-1">
                            Error Analysis:
                          </div>
                          {userAnsIdx !== null && q.options[userAnsIdx]?.errorType ? (
                            <p>
                              You selected Option {userChoiceLetter}. Likely misconception: {q.options[userAnsIdx].errorType}.
                            </p>
                          ) : (
                            <p>
                              This question was skipped or answered incorrectly. Review the governing law and step sequence above.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t-2 border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReturnHome}
            className="px-4 py-2 font-mono-code text-xs uppercase bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] cursor-pointer"
          >
            ← Return to Practice
          </button>
          <button
            onClick={onRetakeTest}
            className="px-6 py-3 font-pixel text-xs sm:text-sm bg-[#d97706] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
          >
            RETAKE TEST WITH NEW QUESTIONS ↵
          </button>
        </div>
      </div>
    </div>
  );
};
