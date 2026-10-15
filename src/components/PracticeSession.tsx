import React, { useState, useEffect } from 'react';
import { DifficultyLevel, Question } from '../types';
import { TOPICS, getTopicById } from '../math/topics';
import { generateQuestion } from '../math/generator';
import { MathView } from './MathView';

interface PracticeSessionProps {
  onOpenReference?: () => void;
  onOpenMockTest?: () => void;
  initialTopicId?: string;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  onOpenReference,
  onOpenMockTest,
  initialTopicId
}) => {
  // Single active topic or 'random'
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopicId || 'random');
  // Single active difficulty level or 'random'
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'random'>('random');

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [problemsAttemptedCount, setProblemsAttemptedCount] = useState<number>(0);

  // Function to generate a new question based on current topic & difficulty states
  const createQuestion = (
    topicVal: string = selectedTopic,
    diffVal: DifficultyLevel | 'random' = selectedDifficulty
  ) => {
    let targetTopicId = topicVal;
    if (topicVal === 'random') {
      const randomIdx = Math.floor(Math.random() * TOPICS.length);
      targetTopicId = TOPICS[randomIdx].id;
    }

    let targetDiff: DifficultyLevel = 1;
    if (diffVal === 'random') {
      targetDiff = (Math.floor(Math.random() * 5) + 1) as DifficultyLevel;
    } else {
      targetDiff = diffVal;
    }

    const q = generateQuestion(targetTopicId, targetDiff);
    setCurrentQuestion(q);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
  };

  // Initial load
  useEffect(() => {
    createQuestion();
  }, []);

  // When student changes the topic from the top buttons
  const handleTopicChange = (newTopic: string) => {
    setSelectedTopic(newTopic);
    createQuestion(newTopic, selectedDifficulty);
  };

  // When student changes the difficulty level from the top buttons
  const handleDifficultyChange = (newDiff: DifficultyLevel | 'random') => {
    setSelectedDifficulty(newDiff);
    createQuestion(selectedTopic, newDiff);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null) return;
    setIsSubmitted(true);
    setProblemsAttemptedCount(prev => prev + 1);
  };

  const handleNext = () => {
    createQuestion(selectedTopic, selectedDifficulty);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  const difficultyBadgeColor = (lvl: DifficultyLevel) => {
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
    }
  };

  const activeTopicObj = currentQuestion ? getTopicById(currentQuestion.topicId) : undefined;
  const isCorrect = currentQuestion && selectedOptionIndex === currentQuestion.correctIndex;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 text-[#e6edf3]">
      {/* ============================================================== */}
      {/* PRACTICE CONTROL DECK (TOPIC & LEVEL BUTTONS DIRECTLY ON TOP)  */}
      {/* ============================================================== */}
      <div className="bg-[#161b22] retro-box p-4 sm:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#30363d] pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#10b981] border border-[#059669] inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h1 className="font-pixel text-xs sm:text-sm text-[#f0f6fc]">
              PRACTICE MODE // CONSOLE
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs text-[#8b949e]">
              Solved: <strong className="text-[#34d399]">{problemsAttemptedCount}</strong>
            </span>
            {onOpenMockTest && (
              <button
                onClick={onOpenMockTest}
                className="px-2.5 py-1 text-[11px] font-mono-code bg-[#21262d] text-[#e6edf3] border border-[#30363d] hover:bg-[#b45309] hover:text-white transition-colors cursor-pointer"
                title="Switch to Mock Test Mode"
              >
                Mock Test Mode →
              </button>
            )}
          </div>
        </div>

        {/* 1. TOPIC SELECTION BUTTONS (DROPDOWN REMOVED) */}
        <div className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
            <div className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#f0f6fc] flex items-center gap-2">
              <span className="text-[#34d399]">1. Topic Selection:</span>
              <span className="text-[11px] font-normal text-[#8b949e]">
                (Click any topic below to switch immediately)
              </span>
            </div>
            {onOpenReference && (
              <button
                type="button"
                onClick={onOpenReference}
                className="font-mono-code text-[11px] text-[#34d399] underline hover:text-[#a7f3d0] cursor-pointer"
              >
                Rules Reference
              </button>
            )}
          </div>

          {/* Quick-select topic buttons (clean, high-contrast retro grid/flow) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => handleTopicChange('random')}
              className={`p-2 text-[11px] font-mono-code font-bold uppercase border-2 text-left cursor-pointer transition-all flex items-center justify-between ${
                selectedTopic === 'random'
                  ? 'bg-[#10b981] text-[#0f1215] border-[#34d399] shadow-[2px_2px_0px_#050709] font-extrabold'
                  : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d] hover:text-white'
              }`}
            >
              <span>🎲 Random Topic</span>
              {selectedTopic === 'random' && <span>✓</span>}
            </button>

            {TOPICS.map((t, idx) => {
              const isSelected = selectedTopic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTopicChange(t.id)}
                  className={`p-2 text-[11px] font-mono-code border-2 text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0e4429] text-[#34d399] border-[#238636] font-bold shadow-[2px_2px_0px_#050709]'
                      : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:border-[#8b949e] hover:bg-[#282e36] hover:text-white'
                  }`}
                  title={`${t.name}: ${t.shortDesc}`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>T{idx + 1}. {t.name}</span>
                    {isSelected && <span className="text-[#34d399]">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DIFFICULTY LEVEL SELECTION BUTTONS */}
        <div className="border-t border-[#30363d] pt-4">
          <div className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#f0f6fc] mb-2 flex items-center justify-between">
            <span className="text-[#34d399]">2. Difficulty Level:</span>
            <span className="text-[11px] font-normal text-[#8b949e]">
              Updates problem instantly
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Random Difficulty Button */}
            <button
              type="button"
              onClick={() => handleDifficultyChange('random')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase border-2 transition-all cursor-pointer ${
                selectedDifficulty === 'random'
                  ? 'bg-[#1f6feb] text-white border-[#58a6ff] shadow-[2px_2px_0px_#050709]'
                  : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d] hover:text-white'
              }`}
            >
              🎲 Random Level (1–5)
            </button>

            {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(lvl => {
              const isSelected = selectedDifficulty === lvl;
              const labels = [
                '',
                'Level 1: Very Basic',
                'Level 2: Basic',
                'Level 3: Moderate',
                'Level 4: Challenging',
                'Level 5: Deep Reasoning'
              ];
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleDifficultyChange(lvl)}
                  className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase border-2 transition-all cursor-pointer ${
                    isSelected
                      ? lvl === 5
                        ? 'bg-[#801919] text-white border-[#f85149] shadow-[2px_2px_0px_#050709]'
                        : 'bg-[#0e4429] text-[#34d399] border-[#238636] shadow-[2px_2px_0px_#050709]'
                      : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d] hover:text-white'
                  }`}
                >
                  {labels[lvl]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN QUESTION CARD (DARK RETRO TERMINAL VIEW)                  */}
      {/* ============================================================== */}
      {!currentQuestion ? (
        <div className="bg-[#161b22] retro-box p-8 text-center font-mono-code text-sm text-[#8b949e]">
          Generating practice question...
        </div>
      ) : (
        <div className="bg-[#161b22] retro-box p-6 sm:p-8 mb-6">
          {/* Question Metadata Header */}
          <div className="flex flex-wrap items-center justify-between border-b-2 border-[#30363d] pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-xs uppercase font-bold text-[#34d399]">
                {currentQuestion.topicName}
              </span>
              {activeTopicObj && (
                <span className="hidden sm:inline-block font-mono-code text-[11px] text-[#8b949e]">
                  — {activeTopicObj.shortDesc}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase ${difficultyBadgeColor(
                  currentQuestion.difficulty
                )}`}
              >
                Level {currentQuestion.difficulty}
              </span>
              {currentQuestion.difficulty === 5 && (
                <span className="text-[10px] font-mono-code bg-[#801919] text-white px-1.5 py-0.5 font-bold border border-[#f85149]">
                  DEEP REASONING
                </span>
              )}
            </div>
          </div>

          {/* Active Formula Cue Banner */}
          {activeTopicObj && (
            <div className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] text-center mb-4 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-[11px] font-mono-code text-[#8b949e] uppercase font-bold">
                Rule Formula:
              </span>
              <MathView math={activeTopicObj.ruleFormula} className="text-[#58a6ff]" />
            </div>
          )}

          {/* Prompt Text */}
          <p className="font-mono-code text-xs sm:text-sm text-[#c9d1d9] mb-3">
            {currentQuestion.promptText}
          </p>

          {/* KaTeX Expression Display Banner */}
          <div className="p-4 sm:p-6 bg-[#0d1117] border-2 border-[#30363d] text-center my-4 overflow-x-auto shadow-inner">
            <MathView
              math={currentQuestion.expressionLatex}
              display={true}
              className="text-xl sm:text-2xl text-[#f0f6fc]"
            />
          </div>

          {/* Domain Restrictions */}
          {currentQuestion.domainRestrictions && (
            <div className="text-[11px] font-mono-code text-[#8b949e] text-right mb-4">
              Domain Restriction: <MathView math={currentQuestion.domainRestrictions} />
            </div>
          )}

          {/* Four Answer Choices */}
          <div className="space-y-3 my-6">
            <div className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-[#8b949e]">
              Select one answer option:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const letter = optionLetters[idx];
                const isSelected = selectedOptionIndex === idx;
                let optionStyle = 'bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] hover:border-[#8b949e]';

                if (isSubmitted) {
                  if (option.isCorrect) {
                    optionStyle = 'bg-[#0d3322] border-[#238636] ring-2 ring-[#238636] text-[#34d399] font-bold';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle = 'bg-[#3c1e1e] border-[#da3633] text-[#f85149] line-through opacity-80';
                  } else {
                    optionStyle = 'bg-[#161b22] border-[#21262d] text-[#6e7681] opacity-50';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'bg-[#0e4429] border-[#238636] ring-2 ring-[#34d399] text-[#f0f6fc] shadow-[2px_2px_0px_#050709]';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={`p-3.5 border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${optionStyle} ${
                      isSubmitted ? 'cursor-default' : ''
                    }`}
                  >
                    <span
                      className={`w-6 h-6 shrink-0 flex items-center justify-center font-mono-code text-xs font-bold border ${
                        isSelected
                          ? 'bg-[#10b981] text-[#0f1215] border-[#10b981]'
                          : 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]'
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 overflow-x-auto py-1">
                      <MathView math={option.latex} />
                    </div>
                    {isSubmitted && option.isCorrect && (
                      <span className="text-xs font-mono-code text-[#34d399] font-bold shrink-0">
                        [CORRECT]
                      </span>
                    )}
                    {isSubmitted && isSelected && !option.isCorrect && (
                      <span className="text-xs font-mono-code text-[#f85149] font-bold shrink-0">
                        [WRONG]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-4 border-t-2 border-[#30363d] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOptionIndex === null}
                  className={`px-6 py-3 font-pixel text-xs sm:text-sm uppercase transition-all ${
                    selectedOptionIndex !== null
                      ? 'bg-[#10b981] text-[#0f1215] retro-btn cursor-pointer font-extrabold'
                      : 'bg-[#21262d] text-[#6e7681] border-2 border-[#30363d] cursor-not-allowed'
                  }`}
                >
                  SUBMIT ANSWER →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 font-pixel text-xs sm:text-sm uppercase bg-[#10b981] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
                >
                  NEXT QUESTION →
                </button>
              )}

              <button
                type="button"
                onClick={() => createQuestion(selectedTopic, selectedDifficulty)}
                className="px-3 py-2 font-mono-code text-xs uppercase bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:text-white cursor-pointer"
                title="Generate another question for this topic/level"
              >
                Skip / New Problem
              </button>
            </div>

            <div className="text-[11px] font-mono-code text-[#8b949e]">
              {isSubmitted
                ? 'Review step-by-step derivation below'
                : 'Select an option and submit to verify'}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP-BY-STEP DERIVATION & EXPLANATION (POST-SUBMISSION)        */}
      {/* ============================================================== */}
      {isSubmitted && currentQuestion && (
        <div className="space-y-6">
          {/* Result Banner */}
          <div
            className={`p-4 border-2 font-mono-code text-xs sm:text-sm flex items-center justify-between gap-3 ${
              isCorrect
                ? 'bg-[#0e4429] border-[#238636] text-[#34d399]'
                : 'bg-[#490202] border-[#da3633] text-[#f85149]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm">
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </span>
              <span>
                {isCorrect
                  ? 'Your solution is mathematically sound.'
                  : 'Your answer did not match the simplified form.'}
              </span>
            </div>
            <div className="text-right">
              Correct Answer:{' '}
              <span className="font-bold underline text-white">
                Option {optionLetters[currentQuestion.correctIndex]}
              </span>
            </div>
          </div>

          {/* Exponent Law Explanation Card */}
          <div className="bg-[#161b22] retro-box p-6">
            <div className="border-b-2 border-[#30363d] pb-2 mb-4">
              <div className="font-mono-code text-[11px] uppercase text-[#34d399] font-bold">
                Fundamental Principle
              </div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#f0f6fc]">
                RELEVANT EXPONENT LAW
              </h3>
            </div>

            <div className="p-3 bg-[#0d1117] border border-[#30363d] text-center my-2">
              <MathView
                math={currentQuestion.ruleSummary}
                display={true}
                className="text-base text-[#58a6ff]"
              />
            </div>

            {/* Step-by-Step Solution */}
            <div className="mt-6">
              <h4 className="font-mono-code text-xs uppercase font-bold text-[#f0f6fc] mb-3">
                STEP-BY-STEP MATHEMATICAL SOLUTION:
              </h4>

              <div className="space-y-3">
                {currentQuestion.solutionSteps.map(step => (
                  <div
                    key={step.step}
                    className="p-3 bg-[#1c2128] border border-[#30363d] text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-code text-xs font-bold text-[#34d399]">
                        Step {step.step}: {step.title}
                      </span>
                    </div>
                    <div className="my-2 py-1.5 px-2 bg-[#0d1117] border border-[#30363d] text-center overflow-x-auto">
                      <MathView math={step.latex} className="text-[#f0f6fc]" />
                    </div>
                    <p className="font-mono-code text-xs text-[#c9d1d9] mt-1 leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistake Callout */}
            {currentQuestion.commonMistakeExplanation && (
              <div className="mt-6 p-4 bg-[#2b1d07] border-2 border-[#d29922] text-[#fbbf24]">
                <div className="font-pixel text-[11px] uppercase mb-1">
                  COMMON MISCONCEPTION / PITFALL:
                </div>
                <p className="font-mono-code text-xs leading-relaxed">
                  {currentQuestion.commonMistakeExplanation}
                </p>
              </div>
            )}

            {/* Selected distractor specific error diagnosis */}
            {!isCorrect &&
              selectedOptionIndex !== null &&
              currentQuestion.options[selectedOptionIndex].errorType && (
                <div className="mt-4 p-3 bg-[#3c1e1e] border border-[#da3633] text-[#f87171] font-mono-code text-xs">
                  <span className="font-bold text-white">
                    Error Diagnosis for Option {optionLetters[selectedOptionIndex]}:{' '}
                  </span>
                  {currentQuestion.options[selectedOptionIndex].errorType}.
                </div>
              )}

            <div className="mt-6 pt-4 border-t border-[#30363d] text-center">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 font-pixel text-xs bg-[#10b981] text-[#0f1215] retro-btn cursor-pointer font-extrabold"
              >
                PROCEED TO NEXT QUESTION →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
