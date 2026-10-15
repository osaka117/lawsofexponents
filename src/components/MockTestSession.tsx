import React, { useState } from 'react';
import { MockTestResult, Question } from '../types';
import { MathView } from './MathView';

interface MockTestSessionProps {
  questions: Question[];
  userAnswers: (number | null)[];
  onAnswerChange: (questionIdx: number, optionIdx: number) => void;
  onSubmitTest: (result: MockTestResult) => void;
  onExit: () => void;
}

export const MockTestSession: React.FC<MockTestSessionProps> = ({
  questions,
  userAnswers,
  onAnswerChange,
  onSubmitTest,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const currentQ = questions[currentIndex];
  const selectedIdx = userAnswers[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = userAnswers.filter(a => a !== null).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSelectOption = (optIdx: number) => {
    onAnswerChange(currentIndex, optIdx);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleJumpTo = (idx: number) => {
    setCurrentIndex(idx);
  };

  const attemptSubmit = () => {
    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      finalizeSubmit();
    }
  };

  const finalizeSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const incorrectCount = totalQuestions - correctCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const result: MockTestResult = {
      totalQuestions,
      correctCount,
      incorrectCount,
      scorePercentage,
      questions,
      userAnswers
    };

    onSubmitTest(result);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  const difficultyBadgeColor = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 'bg-[#1b4731] text-[#34d399] border border-[#238636]';
      case 2:
        return 'bg-[#1c384d] text-[#60a5fa] border border-[#1f6feb]';
      case 3:
        return 'bg-[#433215] text-[#fbbf24] border border-[#d29922]';
      case 4:
        return 'bg-[#4d2516] text-[#fb923c] border border-[#bd561d]';
      case 5:
        return 'bg-[#4c1d1d] text-[#f87171] border border-[#da3633]';
      default:
        return 'bg-[#21262d] text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#e6edf3]">
      {/* Session Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[11px] text-[#d97706]">
            MOCK TEST SESSION
          </span>
          <span className="font-mono-code text-xs text-[#8b949e]">
            ({answeredCount} of {totalQuestions} Answered)
          </span>
        </div>

        <button
          onClick={onExit}
          className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#e6edf3] cursor-pointer"
        >
          Exit Test (Return to Practice)
        </button>
      </div>

      {/* Question Navigator Grid */}
      <div className="bg-[#161b22] border-2 border-[#30363d] p-3 mb-6 retro-box">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono-code text-[11px] uppercase font-bold text-[#f0f6fc]">
            Question Navigator:
          </span>
          <div className="flex items-center gap-3 text-[10px] font-mono-code text-[#8b949e]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#d97706] inline-block border border-[#30363d]" />
              Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#21262d] inline-block border border-[#30363d]" />
              Unanswered
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[idx] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`w-7 h-7 font-mono-code text-xs font-bold transition-all cursor-pointer border ${
                  isCurrent
                    ? 'ring-2 ring-[#38bdf8] scale-105 z-10'
                    : 'hover:border-[#8b949e]'
                } ${
                  isAnswered
                    ? 'bg-[#d97706] text-[#0f1215] border-[#f59e0b] font-extrabold'
                    : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d]'
                }`}
                title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Display */}
      <div className="bg-[#161b22] retro-box p-6 sm:p-8 mb-6">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#30363d] pb-3 mb-6 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs sm:text-sm text-[#f0f6fc]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs font-mono-code text-[#8b949e]">·</span>
            <span className="font-mono-code text-xs uppercase font-bold text-[#d97706]">
              {currentQ.topicName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase ${difficultyBadgeColor(
                currentQ.difficulty
              )}`}
            >
              Level {currentQ.difficulty}
            </span>
            {currentQ.difficulty === 5 && (
              <span className="text-[10px] font-mono-code bg-[#801919] text-white px-1.5 py-0.5 font-bold border border-[#f85149]">
                DEEP REASONING
              </span>
            )}
          </div>
        </div>

        {/* Prompt */}
        <p className="font-mono-code text-xs sm:text-sm text-[#c9d1d9] mb-4">
          {currentQ.promptText}
        </p>

        {/* Expression Box */}
        <div className="p-4 sm:p-6 bg-[#0d1117] border-2 border-[#30363d] text-center my-4 overflow-x-auto">
          <MathView
            math={currentQ.expressionLatex}
            display={true}
            className="text-xl sm:text-2xl text-[#f0f6fc]"
          />
        </div>

        {/* Domain Restrictions */}
        {currentQ.domainRestrictions && (
          <div className="text-[11px] font-mono-code text-[#8b949e] text-right mb-4">
            Domain Restriction: <MathView math={currentQ.domainRestrictions} />
          </div>
        )}

        {/* Four Answer Choices */}
        <div className="space-y-3 my-6">
          <div className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
            Select one answer option:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const letter = optionLetters[idx];
              const isSelected = selectedIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2b1d07] border-[#d97706] ring-2 ring-[#d97706] shadow-[2px_2px_0px_#050709]'
                      : 'bg-[#21262d] border-[#30363d] text-[#c9d1d9] hover:bg-[#282e36] hover:text-white'
                  }`}
                >
                  <span
                    className={`w-6 h-6 shrink-0 flex items-center justify-center font-mono-code text-xs font-bold border ${
                      isSelected
                        ? 'bg-[#d97706] text-[#0f1215] border-[#f59e0b]'
                        : 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]'
                    }`}
                  >
                    {letter}
                  </span>
                  <div className="flex-1 overflow-x-auto py-1">
                    <MathView math={option.latex} />
                  </div>
                  {isSelected && (
                    <span className="text-xs font-mono-code text-[#d97706] font-bold shrink-0">
                      [SELECTED]
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls: PREVIOUS, NEXT, SUBMIT TEST */}
        <div className="pt-6 border-t-2 border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2 font-mono-code text-xs uppercase font-bold border-2 transition-all ${
                currentIndex > 0
                  ? 'bg-[#21262d] text-[#e6edf3] border-[#30363d] hover:bg-[#30363d] cursor-pointer'
                  : 'bg-[#161b22] text-[#484f58] border-[#21262d] cursor-not-allowed'
              }`}
            >
              ← PREVIOUS
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className={`px-4 py-2 font-mono-code text-xs uppercase font-bold border-2 transition-all ${
                currentIndex < totalQuestions - 1
                  ? 'bg-[#21262d] text-[#e6edf3] border-[#30363d] hover:bg-[#30363d] cursor-pointer'
                  : 'bg-[#161b22] text-[#484f58] border-[#21262d] cursor-not-allowed'
              }`}
            >
              NEXT →
            </button>
          </div>

          <button
            onClick={attemptSubmit}
            className="px-6 py-2.5 font-pixel text-xs uppercase bg-[#d97706] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
          >
            SUBMIT TEST ↵
          </button>
        </div>
      </div>

      {/* Unanswered Questions Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] retro-box p-6 max-w-md w-full border-2 border-[#da3633]">
            <div className="border-b-2 border-[#da3633] pb-3 mb-4">
              <h3 className="font-pixel text-sm text-[#f85149]">
                CONFIRM TEST SUBMISSION
              </h3>
            </div>

            <p className="font-mono-code text-xs text-[#c9d1d9] mb-4 leading-relaxed">
              You have <strong className="text-[#f85149]">{unansweredCount} unanswered</strong> question(s) out of {totalQuestions}.
            </p>

            <p className="font-mono-code text-xs text-[#8b949e] mb-6 leading-relaxed">
              Unanswered questions will be scored as incorrect. Would you like to review your answers or submit your test now?
            </p>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-[#30363d]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 font-mono-code text-xs uppercase bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#30363d] cursor-pointer font-bold"
              >
                Return & Review Questions
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  finalizeSubmit();
                }}
                className="px-4 py-2 font-mono-code text-xs uppercase bg-[#da3633] text-white border border-[#f85149] hover:bg-[#b91c1c] cursor-pointer font-bold"
              >
                Submit Test Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
